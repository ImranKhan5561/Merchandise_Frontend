'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'popular' },
];

export default function SortDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get('sort') || 'recommended';
  const currentLabel = SORT_OPTIONS.find(o => o.value === currentSort)?.label || 'Sort By';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'recommended') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] md:text-[15px] font-bold uppercase tracking-wider text-gray-400 transition-all hover:text-[#8B7BB4] group active:scale-95"
      >
        <span>Sort By</span>
        <svg 
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} 
          className={`w-3.5 h-3.5 md:h-6 md:w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-[1.5rem] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-5 py-3 rounded-2xl text-[11px] md:text-[15px] font-bold transition-all flex items-center justify-between ${
                  currentSort === opt.value 
                    ? 'bg-purple-50 text-[#8B7BB4]' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#1A142E]'
                }`}
              >
                {opt.label}
                {currentSort === opt.value && (
                  <div className="w-1 h-1 rounded-full bg-[#8B7BB4]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
