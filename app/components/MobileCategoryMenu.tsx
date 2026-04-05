'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Category } from '../lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileCategoryMenu({ isOpen, onClose }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedRoot, setExpandedRoot] = useState<number | null>(null);
  const [expandedChild, setExpandedChild] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

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
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[101] shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header (More compact) */}
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-[#FDFBFF]">
          <div>
            <h2 className="text-xl font-bold text-[#1A142E] serif">Explore Closet</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8B7BB4] mt-1">Artisan Collections</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-[#C8382A] transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="space-y-0.5">
            <button
              onClick={() => { router.push('/browse'); onClose(); }}
              className="w-full text-left py-2 border-b border-gray-50/50 text-[14px] font-bold text-[#1A142E] flex items-center justify-between group"
            >
              <span>All Pieces</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#8B7BB4] transition-colors">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </button>

            {categories.map((category) => (
              <div key={category.id} className="border-b border-gray-50/50 last:border-0">
                <div className="flex items-center justify-between py-2">
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className={`text-[15px] font-bold transition-all ${expandedRoot === category.id ? 'text-[#8B7BB4]' : 'text-[#1A142E]'}`}
                  >
                    {category.name}
                  </button>
                  {category.children && category.children.length > 0 && (
                    <button 
                      onClick={() => setExpandedRoot(expandedRoot === category.id ? null : category.id)}
                      className="p-2 text-gray-300 hover:text-[#8B7BB4] transition-all"
                    >
                      <svg 
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} 
                        className={`w-4 h-4 transition-transform duration-300 ${expandedRoot === category.id ? 'rotate-180 text-[#8B7BB4]' : ''}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Level 2 Children (Tighter spacing) */}
                {expandedRoot === category.id && category.children && (
                  <div className="ml-4 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-300">
                    {category.children.map((child) => (
                      <div key={child.id}>
                        <div className="flex items-center justify-between py-1.5">
                          <button
                            onClick={() => handleCategoryClick(child.id)}
                            className={`text-[13px] font-medium transition-all ${expandedChild === child.id ? 'text-[#8B7BB4] underline' : 'text-gray-500 hover:text-[#1A142E]'}`}
                          >
                            {child.name}
                          </button>
                          {child.children && child.children.length > 0 && (
                            <button 
                              onClick={() => setExpandedChild(expandedChild === child.id ? null : child.id)}
                              className="p-1 text-gray-200"
                            >
                              <svg 
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} 
                                className={`w-3 h-3 transition-transform ${expandedChild === child.id ? 'rotate-180' : ''}`}
                              >
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Level 3 Grandchildren */}
                        {expandedChild === child.id && child.children && (
                          <div className="ml-4 space-y-2 mb-2">
                            {child.children.map((grandchild) => (
                              <button
                                key={grandchild.id}
                                onClick={() => handleCategoryClick(grandchild.id)}
                                className="block w-full text-left text-[12px] text-gray-400 hover:text-[#1A142E] transition-colors py-1"
                              >
                                {grandchild.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer (More compact) */}
        <div className="px-6 py-4 bg-[#FDFBFF] border-t border-gray-50 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#1A142E] overflow-hidden flex items-center justify-center">
             <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-5 h-5 opacity-60">
                <path d="M12 21v-8m0 0l-4 4m4-4l4 4M12 3v8m0 0l-4-4m4 4l4-4" />
             </svg>
          </div>
          <div className="flex-1">
             <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Premium Piece</p>
             <p className="text-[13px] font-bold text-[#1A142E]">Curated for Excellence</p>
          </div>
        </div>
      </div>
    </>
  );
}
