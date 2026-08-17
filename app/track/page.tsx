import React from 'react'
import { Metadata } from 'next'
import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TrackOrderClient from './TrackOrderClient'

export const metadata: Metadata = {
  title: 'تتبع الطلب | TIF طيف',
  description: 'تتبع حالة طلبك ومسار الشحن بكل سهولة',
}

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen bg-surface text-foreground font-sans flex flex-col" dir="rtl">
      <Navbar />
      <Suspense fallback={<div className="flex-grow min-h-[60vh]" />}>
        <TrackOrderClient />
      </Suspense>
      <Footer />
    </main>
  )
}
