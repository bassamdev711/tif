import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

import prisma from "@/lib/prisma";
import { getSiteUrl, getStoreConfig } from "@/lib/store-config";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700"],
  variable: "--font-tajawal",
});

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreConfig()
  const title = store.nameLatin && store.name !== store.nameLatin
    ? `${store.name} | ${store.nameLatin}`
    : store.name

  return {
    metadataBase: getSiteUrl(store.storeUrl),
    title,
    description: store.description,
    openGraph: {
      title,
      description: store.description,
      ...(store.ogImageUrl ? { images: [{ url: store.ogImageUrl, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: store.description,
      ...(store.ogImageUrl ? { images: [store.ogImageUrl] } : {}),
    },
    icons: {
      icon: store.faviconUrl ?? '/favicon.ico',
      shortcut: store.faviconUrl ?? '/favicon.ico',
      apple: store.faviconUrl ?? '/favicon.ico',
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
  const store = await getStoreConfig()
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
        <SplashScreen storeName={store.name} storeNameLatin={store.nameLatin} />
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
