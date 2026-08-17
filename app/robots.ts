import type { MetadataRoute } from 'next'

const DEFAULT_SITE_URL = 'https://example-store.vercel.app'

function getBaseUrl(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).origin
  } catch {
    return DEFAULT_SITE_URL
  }
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api',
        '/cart',
        '/checkout',
        '/account',
        '/orders',
        '/track',
        '/_next',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
