'use client'

import { startTransition, useCallback, useState, useEffect } from 'react'
import { Bell, CheckCircle2, ShieldAlert } from 'lucide-react'

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function NotificationsSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Replace with your VAPID public key (can be fetched from an API or env)
  const applicationServerKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  const checkSubscription = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return
      
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setError('متصفحك الحالي لا يدعم الإشعارات الفورية (أو أنك تتصفح من داخل تطبيق آخر مثل انستقرام. يرجى فتح الرابط في سفاري أو كروم).')
        setLoading(false)
        return
      }

      // إضافة مهلة زمنية (Timeout) لتجنب تعليق المتصفحات
      const checkPromise = async () => {
        const registration = await navigator.serviceWorker.register('/sw.js')
        const subscription = await registration.pushManager.getSubscription()
        
        if (subscription) {
          setIsSubscribed(true)
        } else if (Notification.permission === 'granted' && applicationServerKey) {
          // محاولة إعادة التفعيل التلقائي إذا كانت الصلاحية ممنوحة مسبقاً (حالة مسح الكاش)
          try {
            const newSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(applicationServerKey)
            })
            await fetch('/api/web-push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newSubscription)
            })
            setIsSubscribed(true)
          } catch (autoErr) {
            console.error('Auto-resubscription failed:', autoErr)
            setIsSubscribed(false)
          }
        } else {
          setIsSubscribed(false)
        }
      }

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهى وقت التحقق من المتصفح')), 5000)
      )

      await Promise.race([checkPromise(), timeoutPromise])

    } catch (err: unknown) {
      console.error('Error checking subscription:', err)
      setError('حدث خطأ أثناء فحص حالة الإشعارات: ' + (err instanceof Error ? err.message : 'غير معروف'))
    } finally {
      setLoading(false)
    }
  }, [applicationServerKey])

  useEffect(() => {
    startTransition(() => {
      void checkSubscription()
    })
  }, [checkSubscription])

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (!applicationServerKey) {
        throw new Error('مفاتيح التشفير غير موجودة (VAPID Key)')
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(applicationServerKey)
      })

      // Send to server
      const res = await fetch('/api/web-push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      })

      if (!res.ok) throw new Error('فشل الحفظ في السيرفر')
      
      setIsSubscribed(true)
      
      // Test Notification locally
      new Notification('مرحباً!', {
        body: 'تم تفعيل الإشعارات بنجاح. ستصلك طلبات المتجر هنا.',
        icon: '/favicon.ico'
      })
      
    } catch (err: unknown) {
      console.error('Subscription failed:', err)
      if (Notification.permission === 'denied') {
        setError('لقد قمت برفض صلاحية الإشعارات مسبقاً. يرجى تفعيلها من إعدادات المتصفح.')
      } else {
        setError(err instanceof Error ? err.message : 'فشل تفعيل الإشعارات.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        
        // Remove from server
        await fetch('/api/web-push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
      }
      setIsSubscribed(false)
    } catch (err) {
      console.error('Unsubscribe failed:', err)
      setError('فشل إيقاف الإشعارات.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-brand mb-2">إعدادات الإشعارات</h1>
      <p className="text-gray-600 mb-8">تفعيل تنبيهات الطلبات الجديدة لتصلك كإشعارات مباشرة على هذا الجهاز.</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6">
            <ShieldAlert size={20} />
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${isSubscribed ? 'bg-emerald/10 text-brand' : 'bg-gray-100 text-gray-400'}`}>
            {isSubscribed ? <CheckCircle2 size={40} /> : <Bell size={40} />}
          </div>
          
          <h2 className="text-xl font-bold text-deep-green mb-3">
            {isSubscribed ? 'الإشعارات مفعلة على هذا الجهاز' : 'الإشعارات غير مفعلة'}
          </h2>
          
          <p className="text-gray-500 mb-8 leading-relaxed">
            {isSubscribed 
              ? 'ستصلك تنبيهات فورية عند قيام أي عميل بإتمام طلب جديد، أو عند رفع إثبات دفع التحويل البنكي، حتى لو كان المتصفح مغلقاً.'
              : 'قم بتفعيل الإشعارات الآن لتتمكن من متابعة طلبات المتجر لحظة بلحظة دون الحاجة لإبقاء لوحة التحكم مفتوحة دائماً.'}
          </p>

          {loading ? (
            <button disabled className="btn btn-secondary btn-lg disabled:opacity-50 cursor-not-allowed rounded-full">
              جاري التحقق من المتصفح...
            </button>
          ) : isSubscribed ? (
            <button 
              onClick={handleUnsubscribe}
              className="bg-gray-100 text-gray-600 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors"
            >
              إيقاف الإشعارات
            </button>
          ) : (
            <button 
              onClick={handleSubscribe}
              className="bg-gold text-deep-green font-bold py-3 px-8 rounded-full hover:bg-gold/90 transition-colors shadow-lg shadow-gold/20 flex items-center gap-2"
            >
              <Bell size={20} />
              تفعيل الإشعارات الآن
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
