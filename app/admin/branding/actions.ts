'use server'

import prisma from '@/lib/prisma'
import { put } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from '@/lib/auth'

export async function getBrandingSettings() {
  await verifyAdmin()
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 'singleton' },
      select: {
        ogImageUrl: true,
        faviconUrl: true,
        storeUrl: true,
        storeName: true,
      }
    })
    return { success: true, settings }
  } catch {
    return { success: false, error: 'فشل في جلب إعدادات الهوية البصرية' }
  }
}

export async function uploadOgImage(formData: FormData) {
  await verifyAdmin()
  try {
    const file = formData.get('ogImage') as File
    if (!file || file.size === 0) return { success: false, error: 'لم يتم اختيار ملف' }

    const blob = await put(`branding/og-image-${Date.now()}.${file.name.split('.').pop()}`, file, {
      access: 'public',
      contentType: file.type,
    })

    await prisma.storeSettings.upsert({
      where: { id: 'singleton' },
      update: { ogImageUrl: blob.url },
      create: { id: 'singleton', ogImageUrl: blob.url, updatedAt: new Date() }
    })

    revalidatePath('/')
    return { success: true, url: blob.url }
  } catch (error) {
    console.error('OG Image upload error:', error)
    return { success: false, error: 'فشل في رفع الصورة' }
  }
}

export async function uploadFavicon(formData: FormData) {
  await verifyAdmin()
  try {
    const file = formData.get('favicon') as File
    if (!file || file.size === 0) return { success: false, error: 'لم يتم اختيار ملف' }

    const blob = await put(`branding/favicon-${Date.now()}.${file.name.split('.').pop()}`, file, {
      access: 'public',
      contentType: file.type,
    })

    await prisma.storeSettings.upsert({
      where: { id: 'singleton' },
      update: { faviconUrl: blob.url },
      create: { id: 'singleton', faviconUrl: blob.url, updatedAt: new Date() }
    })

    revalidatePath('/')
    return { success: true, url: blob.url }
  } catch (error) {
    console.error('Favicon upload error:', error)
    return { success: false, error: 'فشل في رفع الأيقونة' }
  }
}

export async function saveStoreUrl(url: string) {
  await verifyAdmin()
  try {
    if (!url) return { success: false, error: 'الرابط فارغ' }
    
    await prisma.storeSettings.upsert({
      where: { id: 'singleton' },
      update: { storeUrl: url },
      create: { id: 'singleton', storeUrl: url, updatedAt: new Date() }
    })

    return { success: true }
  } catch {
    return { success: false, error: 'فشل في حفظ رابط المتجر' }
  }
}
