'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api, ProductCard as ProductCardType, Category } from '../lib/api';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface DiscoverMoreSectionProps {
  categories: Category[];
  initialSort?: string;
}

export default function DiscoverMoreSection({ categories, initialSort }: DiscoverMoreSectionProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchProducts = useCallback(async (pageNum: number, categoryId: number | null, isNewCategory = false) => {
    setLoading(true);
    try {
      const res = await api.products.list({
        page: pageNum,
        per_page: 12,
        category_id: categoryId || '',
        sort_by: initialSort || ''
      });

      if (res.ok && res.data) {
        const newProducts = res.data.products;
        setProducts(prev => isNewCategory ? newProducts : [...prev, ...newProducts]);
        setHasMore(newProducts.length === 12);
      }
    } catch (error) {
      console.error('Failed to fetch discovery products:', error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [initialSort]);

  // Reset and fetch when category changes
  useEffect(() => {
    setPage(1);
    setIsInitialLoad(true);
    fetchProducts(1, activeCategoryId, true);
  }, [activeCategoryId, fetchProducts]);

  // Fetch more when page changes (but not on first page which is handled by category effect)
  useEffect(() => {
    if (page > 1) {
      fetchProducts(page, activeCategoryId, false);
    }
  }, [page, activeCategoryId, fetchProducts]);

  // Tab Scroll Logic (Reused from FeaturedSection)
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkTabScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkTabScroll();
    window.addEventListener('resize', checkTabScroll);
    return () => window.removeEventListener('resize', checkTabScroll);
  }, [categories]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="pb-32">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
        <div>
          <h2 className="text-4xl font-semibold text-[#1A142E] mb-3 tracking-tight">Discover More</h2>
          <p className="text-base font-medium text-gray-400">Explore our full collection of artisan goods</p>
        </div>

        {/* Category Tabs with Scroll Arrows */}
        <div className="relative group md:max-w-[60%]">
          {showLeftArrow && (
            <button 
              onClick={() => scrollTabs('left')}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:text-[#8B7BB4] transition-all border border-gray-100 hidden md:flex"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}

          <div 
            ref={scrollRef}
            onScroll={checkTabScroll}
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
              All Items
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
          </div>

          {showRightArrow && (
            <button 
              onClick={() => scrollTabs('right')}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:text-[#8B7BB4] transition-all border border-gray-100 hidden md:flex"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-x-8 md:gap-x-12 gap-y-15 md:gap-y-20">
        {products.map((p, i) => (
          <ProductCard key={`${p.id}-${i}`} product={p} index={i} />
        ))}
        
        {/* Loading Skeletons */}
        {loading && [...Array(6)].map((_, i) => (
          <div key={`skeleton-${i}`} className="animate-pulse">
            <div className="aspect-[4/5] bg-gray-100 rounded-2xl mb-4" />
            <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>

      {/* Sentinel for IntersectionObserver */}
      <div ref={lastElementRef} className="h-20 flex items-center justify-center mt-10">
        {loading && !isInitialLoad && (
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-[#8B7BB4] animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-[#8B7BB4] animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-[#8B7BB4] animate-bounce" />
          </div>
        )}
        {!hasMore && products.length > 0 && (
          <p className="text-gray-300 font-medium text-sm italic">You've reached the end of the collection.</p>
        )}
      </div>
      
      {!loading && products.length === 0 && !isInitialLoad && (
        <div className="py-20 text-center">
          <p className="text-gray-300 font-medium text-lg">No items found in this category.</p>
        </div>
      )}
    </section>
  );
}
