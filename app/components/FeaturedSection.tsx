'use client';

import { useState, useEffect, useRef } from 'react';
import { api, ProductCard as ProductCardType, Category } from '../lib/api';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface FeaturedSectionProps {
  initialProducts: ProductCardType[];
  categories: Category[];
}

export default function FeaturedSection({ initialProducts, categories }: FeaturedSectionProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductCardType[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  // Fetch products when category changes (except for initial "All" state)
  useEffect(() => {
    if (activeCategoryId === null) {
      setProducts(initialProducts);
      return;
    }

    async function fetchFeaturedByCategory() {
      setLoading(true);
      try {
        const res = await api.products.list({ 
          featured: 'true', 
          category_id: activeCategoryId as number,
          per_page: 6 
        });
        if (res.ok) {
          setProducts(res.data?.products || []);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to fetch featured products by category:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedByCategory();
  }, [activeCategoryId, initialProducts]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="pt-1 md:pt-3 lg:pt-7 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mt-3 md:mt-10 md:mb-16 gap-6 md:gap-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-semibold text-[#1A142E] mb-1 sm:mb-3 tracking-tight">Featured Products</h2>
          <p className="text-base font-medium text-gray-400">Handpicked pieces from global artisans</p>
        </div>

        {/* Category Tabs with Scroll Arrows */}
        <div className="relative group md:max-w-[70%]">
          {showLeftArrow && (
            <button 
              onClick={() => scroll('left')}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:text-[#8B7BB4] transition-all border border-gray-100 hidden md:flex"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}

          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-3 md:gap-8 overflow-x-auto scrollbar-none pb-2 lg:pb-0 px-1"
          >
            <button
              onClick={() => setActiveCategoryId(null)}
              className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap pb-2 transition-all border-b-2 ${
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
                className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap pb-2 transition-all border-b-2 ${
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

          {showRightArrow && (
            <button 
              onClick={() => scroll('right')}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:text-[#8B7BB4] transition-all border border-gray-100 hidden md:flex"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-x-6 md:gap-x-12 gap-y-15 md:gap-y-20 transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
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
