'use client';

import { useState, useEffect } from 'react';
import { api, ProductCard as ProductCardType, Category } from '../lib/api';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface PopularSectionProps {
  initialProducts: ProductCardType[];
  categories: Category[];
}

export default function PopularSection({ initialProducts, categories }: PopularSectionProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductCardType[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  // Fetch products when category changes (except for initial "All" state)
  useEffect(() => {
    if (activeCategoryId === null) {
      setProducts(initialProducts);
      return;
    }

    async function fetchPopularByCategory() {
      setLoading(true);
      try {
        const res = await api.products.list({ 
          featured: 'true', 
          category_id: activeCategoryId as number,
          per_page: 4 
        });
        setProducts(res.products);
      } catch (error) {
        console.error('Failed to fetch popular products by category:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPopularByCategory();
  }, [activeCategoryId, initialProducts]);

  return (
    <section className="pt-3 md:pt-7 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-semibold text-[#1A142E] mb-3 tracking-tight">Featured Products</h2>
          <p className="text-base font-medium text-gray-400">Handpicked pieces from global artisans</p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 md:gap-8 overflow-x-auto scrollbar-none pb-2 lg:pb-0">
          <button
            onClick={() => setActiveCategoryId(null)}
            className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap pb-2 transition-all border-b-2 ${
              activeCategoryId === null 
                ? 'text-[#8B7BB4] border-[#8B7BB4]' 
                : 'text-gray-300 border-transparent hover:text-gray-500'
            }`}
          >
            All Collections
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap pb-2 transition-all border-b-2 ${
                activeCategoryId === cat.id 
                  ? 'text-[#8B7BB4] border-[#8B7BB4]' 
                  : 'text-gray-300 border-transparent hover:text-gray-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
          
          <Link href="/browse" className="text-[10px] font-black text-gray-400 hover:text-[#8B7BB4] transition-all uppercase tracking-[0.2em] pb-2 border-b-2 border-transparent">
            View All →
          </Link>
        </div>
      </div>

      <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-x-8 md:gap-x-12 gap-y-15 md:gap-y-20 transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        {products.length > 0 ? (
          products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-300 font-medium">No popular items found in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
