'use client'

import { startTransition, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  storeName?: string
  storeNameLatin?: string
}

export default function SplashScreen({
  storeName = 'متجرك',
  storeNameLatin = 'YOUR STORE',
}: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    // التحقق مما إذا كان المستخدم قد رأى الشاشة في هذه الجلسة
    const splashKey = `store_splash_seen:${storeNameLatin || storeName}`
    const hasSeenSplash = sessionStorage.getItem(splashKey)
    
    if (!hasSeenSplash) {
      startTransition(() => {
        setShowSplash(true)
      })
      sessionStorage.setItem(splashKey, 'true')
      
      // إبقاء شاشة البداية قصيرة حتى لا تعيق الوصول للمحتوى.
      const timer = setTimeout(() => {
        setShowSplash(false)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [storeName, storeNameLatin])

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[99999] bg-brand flex items-center justify-center overflow-hidden"
          dir="ltr"
        >
          {/* القطرة الذهبية التي تسقط */}
          <motion.div
            initial={{ y: -300, scale: 0.5, opacity: 0 }}
            animate={{ 
              y: 0, 
              scale: [0.5, 1, 1.2, 1],
              opacity: [0, 1, 1, 0] // تختفي بعد الاصطدام
            }}
            transition={{ 
              duration: 1.2,
              times: [0, 0.6, 0.8, 1],
              ease: "easeIn"
            }}
            className="absolute w-8 h-12 bg-gradient-to-b from-accent/50 to-accent rounded-t-full rounded-b-[40%] shadow-[0_0_30px_rgba(200,164,93,0.8)]"
            style={{ filter: 'drop-shadow(0px 10px 10px rgba(200,164,93,0.5))' }}
          />

          {/* الموجة / الدائرة الذهبية الناتجة عن الاصطدام */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.5, 4], 
              opacity: [0, 1, 0] 
            }}
            transition={{ 
              delay: 1, // تبدأ فور وصول القطرة
              duration: 1.5,
              ease: "easeOut"
            }}
            className="absolute w-40 h-40 border-[3px] border-accent rounded-full"
          />

          {/* وهج داخلي */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1], 
              opacity: [0, 0.5, 0] 
            }}
            transition={{ 
              delay: 1.1,
              duration: 1.5,
              ease: "easeOut"
            }}
            className="absolute w-64 h-64 bg-accent/20 rounded-full blur-2xl"
          />

          {/* شعار المتجر الذي ينبثق */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: 1.4, // يظهر بعد توسع الدائرة
              duration: 0.8,
              ease: "easeOut"
            }}
            className="relative z-10 flex flex-col items-center justify-center text-center"
          >
            <div className="w-32 h-32 rounded-full border border-accent/40 flex flex-col items-center justify-center p-4 shadow-[inset_0_0_20px_rgba(200,164,93,0.2)] bg-brand/50 backdrop-blur-sm relative overflow-hidden">
              {/* لمعة تمر على الشعار */}
              <motion.div 
                initial={{ left: '-100%' }}
                animate={{ left: '200%' }}
                transition={{ delay: 1.8, duration: 1, ease: 'easeInOut' }}
                className="absolute top-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
              />
              
              <span className="text-accent font-black text-2xl sm:text-3xl tracking-widest leading-none mb-2 text-center">{storeNameLatin}</span>
              <div className="w-10 h-[1px] bg-accent/50 mb-2" />
              <span className="text-surface font-light text-sm tracking-[0.2em] text-center">{storeName}</span>
            </div>
          </motion.div>
          <button
            type="button"
            onClick={() => setShowSplash(false)}
            className="absolute bottom-8 z-10 rounded-full border border-surface/30 px-4 py-2 text-xs text-surface/80 transition-colors hover:border-accent hover:text-accent"
          >
            تخطي
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
