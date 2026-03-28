import { api } from '@/app/lib/api';
import ProductDetailView from '../../components/ProductDetailView';
import Navbar from '@/app/components/Navbar';
import BottomNav from '@/app/components/BottomNav';
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const { ok, data: product } = await api.products.show(slug);
    
    if (!ok || !product) return notFound();
    
    return (
      <div className="bg-bg min-h-screen">
        <Navbar />
        <main className="container-custom pt-12 pb-32">
          <ProductDetailView product={product} />
        </main>
        <BottomNav />
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return notFound();
  }
}
