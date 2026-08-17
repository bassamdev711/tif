'use client'

import React, { createContext, startTransition, useContext, useState, useEffect, ReactNode } from 'react'
import { useCurrency } from '@/components/CurrencyProvider'

export interface CartItem {
  id: string // Product ID
  name: string
  slug: string
  price: number
  imageUrl: string
  quantity: number
  maxStock: number
}

export interface AppliedCoupon {
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  discountAmount: number
  minOrderAmount: number | null
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
  // كوبون الخصم
  appliedCoupon: AppliedCoupon | null
  couponLoading: boolean
  couponError: string | null
  applyCoupon: (code: string) => Promise<void>
  removeCoupon: () => void
  finalTotal: number  // cartTotal بعد تطبيق الخصم
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const currency = useCurrency()

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tif_cart')
      const storedCoupon = localStorage.getItem('tif_coupon')
      startTransition(() => {
        if (stored) setCartItems(JSON.parse(stored))
        if (storedCoupon) setAppliedCoupon(JSON.parse(storedCoupon))
      })
    } catch (error) {
      console.error('Failed to parse cart from local storage', error)
    }
    startTransition(() => {
      setIsLoaded(true)
    })
  }, [])

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('tif_cart', JSON.stringify(cartItems))
    }
  }, [cartItems, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      if (appliedCoupon) {
        localStorage.setItem('tif_coupon', JSON.stringify(appliedCoupon))
      } else {
        localStorage.removeItem('tif_coupon')
      }
    }
  }, [appliedCoupon, isLoaded])

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)

  // Re-validate coupon if cart total changes
  useEffect(() => {
    if (isLoaded && appliedCoupon && appliedCoupon.minOrderAmount !== null) {
      startTransition(() => {
        if (cartTotal < appliedCoupon.minOrderAmount!) {
          setAppliedCoupon(null)
          setCouponError(`تم إزالة الكوبون لأن مجموع السلة أقل من الحد الأدنى (${appliedCoupon.minOrderAmount} ${currency})`)
        } else if (appliedCoupon.type === 'PERCENTAGE') {
          const discountAmount = Math.round(((cartTotal * appliedCoupon.value) / 100) * 100) / 100
          if (discountAmount !== appliedCoupon.discountAmount) {
            setAppliedCoupon({ ...appliedCoupon, discountAmount })
          }
        }
      })
    }
  }, [cartTotal, isLoaded, appliedCoupon, currency])

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        const max = existing.maxStock ?? 99
        const newQuantity = Math.min(existing.quantity + item.quantity, max)
        return prev.map(i => i.id === item.id ? { ...i, quantity: newQuantity } : i)
      }
      const itemMax = item.maxStock ?? 99
      return [...prev, { ...item, quantity: Math.min(item.quantity, itemMax), maxStock: itemMax }]
    })
  }

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    setCartItems(prev => prev.map(i => {
      if (i.id === id) {
        const max = i.maxStock ?? 99
        return { ...i, quantity: Math.min(quantity, max) }
      }
      return i
    }))
  }

  const clearCart = () => {
    setCartItems([])
    setAppliedCoupon(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tif_cart')
      localStorage.removeItem('tif_coupon')
    }
  }

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  // تطبيق الكوبون
  const applyCoupon = async (code: string) => {
    if (!code.trim()) return
    setCouponLoading(true)
    setCouponError(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderTotal: cartTotal }),
      })
      const data = await res.json()
      if (data.valid) {
        setAppliedCoupon(data.coupon)
        setCouponError(null)
      } else {
        setCouponError(data.error || 'كوبون غير صالح')
        setAppliedCoupon(null)
      }
    } catch {
      setCouponError('حدث خطأ أثناء التحقق من الكوبون')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponError(null)
  }

  const finalTotal = appliedCoupon
    ? Math.max(0, cartTotal - appliedCoupon.discountAmount)
    : cartTotal

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      appliedCoupon,
      couponLoading,
      couponError,
      applyCoupon,
      removeCoupon,
      finalTotal,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
