import type { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

const DEFAULT_SITE_URL = 'https://tif-lyart.vercel.app'

type SitemapRecord = { slug: string; updatedAt: Date }

function getBaseUrl(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).origin
  } catch {
    return DEFAULT_SITE_URL
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })

    const productUrls = products.map((product: SitemapRecord) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })

    const collectionUrls = collections.map((collection: SitemapRecord) => ({
      url: `${baseUrl}/products?collection=${encodeURIComponent(collection.slug)}`,
      lastModified: collection.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    const pages = await prisma.legalPage.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })

    const pageUrls = pages.map((page: SitemapRecord) => ({
      url: `${baseUrl}/pages/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    const routes = ['', '/products', '/contact'].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }))

    return [...routes, ...collectionUrls, ...productUrls, ...pageUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
    ]
  }
}
