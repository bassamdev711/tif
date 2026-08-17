'use client'

import React, { createContext, startTransition, useContext, useState, ReactNode, useEffect } from 'react'

export interface CheckoutData {
  fullName: string
  phone: string
  governorate: string
  city: string
  address: string
  paymentMethod: string
  shippingFee: number
}

interface CheckoutContextType {
  checkoutData: CheckoutData
  setCheckoutData: (data: CheckoutData) => void
}

const defaultData: CheckoutData = {
  fullName: '',
  phone: '',
  governorate: '',
  city: '',
  address: '',
  paymentMethod: 'bank_transfer',
  shippingFee: 0,
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [checkoutData, setCheckoutDataState] = useState<CheckoutData>(defaultData)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tif_checkout')
      if (stored) {
        startTransition(() => {
          setCheckoutDataState(JSON.parse(stored))
        })
      }
    } catch {
      console.error('Failed to load checkout data')
    }
  }, [])

  const setCheckoutData = (data: CheckoutData) => {
    setCheckoutDataState(data)
    localStorage.setItem('tif_checkout', JSON.stringify(data))
  }

  return (
    <CheckoutContext.Provider value={{ checkoutData, setCheckoutData }}>
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider')
  }
  return context
}
