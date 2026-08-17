import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

import prisma from "@/lib/prisma";

const DEFAULT_SITE_URL = 'https://tif-lyart.vercel.app'

function getSiteUrl(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL)
  } catch {
    return new URL(DEFAULT_SITE_URL)
  }
}

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700"],
  variable: "--font-tajawal",
});

export async function generateMetadata(): Promise<Metadata> {
  let ogImageUrl: string | null = null
  let faviconUrl: string | null = null
  let storeName = "TIF | طيف - حيث تتحول الرائحة إلى حضور"
  let storeDesc = "عطور كريستالية مستوحاة من الضوء والهدوء والفخامة المطلقة"

  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'singleton' },
      select: { ogImageUrl: true, faviconUrl: true, storeName: true, storeDescription: true }
    })
    ogImageUrl = settings?.ogImageUrl ?? null
    faviconUrl = settings?.faviconUrl ?? null
    if (settings?.storeName) storeName = settings.storeName
    if (settings?.storeDescription) storeDesc = settings.storeDescription
  } catch {}

  return {
    metadataBase: getSiteUrl(),
    title: storeName,
    description: storeDesc,
    openGraph: {
      title: storeName,
      description: storeDesc,
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: storeName,
      description: storeDesc,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    icons: {
      icon: faviconUrl ?? '/favicon.ico',
      shortcut: faviconUrl ?? '/favicon.ico',
      apple: faviconUrl ?? '/favicon.ico',
    },
  }
}

import { CartProvider } from "@/components/CartProvider";
import { CheckoutProvider } from "@/components/CheckoutProvider";
import { CartAnimationProvider } from "@/components/CartAnimationProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { ConfirmProvider } from "@/components/ConfirmProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import AnnouncementBar from "@/components/AnnouncementBar";
import VisitorTracker from "@/components/VisitorTracker";
import SplashScreen from "@/components/SplashScreen";
import MobileBottomNav from "@/components/MobileBottomNav";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let currency = "ر.س"
  try {
    const paymentSettings = await prisma.paymentSettings.findUnique({
      where: { id: 'singleton' },
      select: { currency: true }
    })
    if (paymentSettings?.currency) {
      currency = paymentSettings.currency
    }
  } catch {}

  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-surface text-foreground overflow-x-hidden pb-16 md:pb-0">
        <SplashScreen />
        <VisitorTracker />
        <CurrencyProvider currency={currency}>
          <ToastProvider>
            <ConfirmProvider>
              <CartAnimationProvider>
                <CheckoutProvider>
                  <CartProvider>
                    <FavoritesProvider>
                      <AnnouncementBar />
                      {children}
                      <MobileBottomNav />

                    </FavoritesProvider>
                  </CartProvider>
                </CheckoutProvider>
              </CartAnimationProvider>
            </ConfirmProvider>
          </ToastProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
