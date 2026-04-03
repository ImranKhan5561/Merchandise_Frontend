'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, Category } from '../lib/api';

export default function CategoryMegaMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { ok, data } = await api.categories.list();
      if (ok) {
        setCategories(data as unknown as Category[]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCategoryClick = (id: number) => {
    router.push(`/browse?category_id=${id}`);
    setActiveCategory(null);
  };

  return (
    <div className="bg-white border-b border-gray-100 hidden md:block">
      <div className="container-custom relative">
        <div className="flex items-center gap-10 h-12">
          <Link href="/" className="text-[13px] font-bold text-[#1A142E] hover:text-[#8B7BB4] transition-colors">
            Home
          </Link>
          {categories.map((category) => (
            <div
              key={category.id}
              className="h-full flex items-center"
              onMouseEnter={() => setActiveCategory(category.id)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={`text-[13px] font-bold transition-all h-full border-b-2 flex items-center ${
                  activeCategory === category.id
                    ? 'text-[#8B7BB4] border-[#8B7BB4]'
                    : 'text-[#1A142E] border-transparent hover:text-[#8B7BB4]'
                }`}
              >
                {category.name}
              </button>

              {/* Mega Dropdown */}
              {activeCategory === category.id && category.children && category.children.length > 0 && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full left-0 w-full bg-white shadow-2xl z-[100] border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="container-custom py-10 grid grid-cols-5 gap-8">
                    {category.children.map((child) => (
                      <div key={child.id} className="space-y-4">
                        <button
                          onClick={() => handleCategoryClick(child.id)}
                          className="text-[14px] font-black uppercase tracking-widest text-[#1A142E] hover:text-[#8B7BB4] transition-colors block text-left"
                        >
                          {child.name}
                        </button>
                        
                        <div className="space-y-2">
                          {child.children && child.children.map((grandchild) => (
                            <button
                              key={grandchild.id}
                              onClick={() => handleCategoryClick(grandchild.id)}
                              className="text-[13px] text-gray-400 hover:text-[#1A142E] transition-colors block text-left w-full"
                            >
                              {grandchild.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Featured Image/Promo in Menu */}
                    <div className="col-span-1 rounded-3xl overflow-hidden relative group aspect-[4/5] bg-gray-50">
                      {category.image_url && (
                        <img 
                          src={category.image_url} 
                          alt={category.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Shop</p>
                        <h4 className="text-xl font-bold leading-tight">{category.name} Collection</h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link href="/browse" className="text-[13px] font-bold text-[#1A142E] hover:text-[#8B7BB4] transition-colors">
            All Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
