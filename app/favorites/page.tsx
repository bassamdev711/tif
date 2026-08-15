import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FavoritesClient from "./FavoritesClient";

export const metadata = {
  title: 'المفضلة | TIF طيف',
  description: 'منتجاتك المفضلة من عطور طيف',
};

export default function FavoritesPage() {
  return (
    <main className="min-h-screen bg-surface-alt font-sans flex flex-col" dir="rtl">
      <Navbar />
      <div className="flex-grow">
        <FavoritesClient />
      </div>
      <Footer />
    </main>
  );
}
