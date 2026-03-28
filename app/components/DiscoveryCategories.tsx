'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Category } from '../lib/api';

interface DiscoveryCategoriesProps {
  categories: Category[];
}

export default function DiscoveryCategories({ categories }: DiscoveryCategoriesProps) {
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
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group">
      {/* Scroll Arrows - Desktop Only */}
      {showLeftArrow && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-[-20px] top-[40%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-700 hover:text-[#8B7BB4] transition-all border border-white/50 hidden md:flex hover:scale-110 active:scale-95"
          aria-label="Scroll Left"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-1 md:gap-12 overflow-x-auto scrollbar-none pb-4 scroll-smooth"
      >
        {categories.map((cat, i) => (
          <Link 
            key={cat.id} 
            href={`/browse?category_id=${cat.id}`} 
            className="group flex flex-col items-center gap-3 md:gap-6 flex-shrink-0"
          >
            <div className="w-19 md:w-32 h-19 md:h-32 rounded-full overflow-hidden group-hover:border-[#8B7BB4] transition-all p-1 bg-white shadow-soft group-hover:shadow-2xl">
              <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center overflow-hidden relative">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img 
                   src={cat.image_url || `https://images.unsplash.com/photo-${[
                     '1515886657613-9f3515b0c78f', // fashion
                     '1483985988355-763728e1935b', // shopping
                     '1496747611176-843222e1e57c', // accessories
                     '1539109132381-31a15b2c6a63', // dresses
                     '1485968579580-b6d095142e6e', // accessories
                   ][i % 5]}?q=80&w=300&auto=format&fit=crop`} 
                   alt={cat.name} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                 />
              </div>
            </div>
            <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] group-hover:text-[#8B7BB4] transition-colors text-center">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      {showRightArrow && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-[-20px] top-[40%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-700 hover:text-[#8B7BB4] transition-all border border-white/50 hidden md:flex hover:scale-110 active:scale-95"
          aria-label="Scroll Right"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
