import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getCurrency } from '@/lib/currency'
import ProductCard from '@/components/ProductCard'
import CategoryFilterChips from '@/components/CategoryFilterChips'

export const metadata: Metadata = {
  title: 'تصنيفاتنا | TIF طيف',
  description: 'اكتشف تصنيفاتنا المختلفه',
}

export const dynamic = 'force-dynamic'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>
}) {
  const currency = await getCurrency()

  const { collection } = await searchParams

  // جلب الحقول الأساسية فقط — لا حاجة للوصف أو الصور المتعددة في القائمة
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      ...(collection ? { collection: { slug: collection } } : {}),
    },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      price: true,
      compareAtPrice: true,
      imageUrl: true,
      featured: true,
    },
  })

  // جلب التصنيفات النشطة للفلاتر
  const dbCollections = await prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  // قائمة الروابط للـ Chips في الديسكتوب
  const chipFilters = [
    { label: 'الكل', href: '/products', imageUrl: null },
    ...dbCollections.map(c => ({
      label: c.name,
      href: `/products?collection=${c.slug}`,
      imageUrl: c.imageUrl
    }))
  ]

  return (
    <main className="min-h-screen bg-surface text-foreground font-sans flex flex-col" dir="rtl">
      <Navbar />

      <div className="flex-grow pt-16 md:pt-20 pb-24 relative">
        {/* Quick Filter Chips — Responsive & Sticky */}
        <CategoryFilterChips filters={chipFilters} activeCollection={collection} />

        {/* Product Grid */}
        <section className="px-3 md:px-12 max-w-7xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-20 text-foreground/50 text-lg">
              لا توجد منتجات في هذه المجموعة حالياً
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: Number(product.price),
                    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
                    imageUrl: product.imageUrl || '',
                    brand: product.brand || undefined,
                  }}
                  currency={currency}
                  priority={index < 4}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  )
}
