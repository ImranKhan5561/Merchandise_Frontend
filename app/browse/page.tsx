'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, ProductCard as ProductCardType, Category } from '../lib/api';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';

function BrowseContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, total_pages: 1 });
  const selectedCat = params.get('category_id') || '';

  const load = useCallback(async (catId: string, page = 1) => {
    setLoading(true);
    try {
      const query: Record<string, string | number> = { page, per_page: 12 };
      if (catId) query.category_id = catId;
      const res = await api.products.list(query);
      if (res.ok) {
        setProducts(prev => page === 1 ? res.data?.products || [] : [...prev, ...(res.data?.products || [])]);
        setMeta(res.data?.meta || { total: 0, page: 1, total_pages: 1 });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.categories.list().then(r => setCategories(r.data as unknown as Category[])).catch(() => {});
    load(selectedCat, 1);
  }, [selectedCat, load]);

  return (
    <div className="bg-[#FDFBFF] min-h-screen">
      <Navbar />

      <main className="container-custom py-8 md:py-16">
        <header className="mb-10 md:mb-16 text-center">
           <div className="inline-block px-4 py-1.5 bg-[#8B7BB4]/10 rounded-full text-[#8B7BB4] text-[10px] font-black uppercase tracking-widest mb-6 transition-all animate-in fade-in slide-in-from-bottom-2">
             {selectedCat ? categories.find(c => String(c.id) === selectedCat)?.name || 'Collection' : 'All Collections'}
           </div>
           <h1 className="text-4xl md:text-7xl font-bold serif text-[#1A142E] mb-4 md:mb-6 tracking-tight px-4">
             {params.get('search') ? `Results for "${params.get('search')}"` : (selectedCat ? categories.find(c => String(c.id) === selectedCat)?.name : 'The Artisan Closet')}
           </h1>
           <p className="text-[#6B6580] font-medium text-sm md:text-lg max-w-2xl mx-auto opacity-70 px-4">
             Explore our curated selection of high-quality pieces designed for the modern individual who values both style and tradition.
           </p>
        </header>

        {/* Filters Top Bar */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 justify-between items-start lg:items-end mb-10 md:mb-16 border-b border-gray-100 pb-8 px-4 md:px-0">
           <div className="flex flex-col gap-1 md:gap-2">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-300">Showing</span>
              <p className="text-xs md:text-sm font-bold text-[#1A142E]">{meta.total} unique pieces found</p>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="flex-1 lg:w-80 relative group">
                 <input 
                   type="text" 
                   placeholder="Search within this collection..." 
                   defaultValue={params.get('search') || ''}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       router.push(`/browse?search=${(e.target as HTMLInputElement).value}`);
                     }
                   }}
                   className="w-full bg-[#FDFBFF] border-b border-gray-200 py-3 pl-8 pr-4 text-xs md:text-sm font-medium focus:border-[#8B7BB4] outline-none transition-all" 
                 />
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
              <button className="whitespace-nowrap px-8 py-3 bg-[#1A142E] text-white rounded-2xl flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all hover:bg-black shadow-xl">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path d="M4 21v-7m0-4V3m8 18v-11m0-4V3m8 18v-3m0-4V3M1 14h6m2-10h6m2 14h6"/></svg>
                 <span>Refine Results</span>
              </button>
           </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
           {products.map((p, i) => (
             <ProductCard key={p.id} product={p} index={i} />
           ))}
        </div>

        {/* Empty? */}
        {!loading && products.length === 0 && (
          <div className="py-32 text-center serif text-3xl text-gray-200">
             No artisan pieces found in this collection.
          </div>
        )}

        {/* Load More */}
        {meta.page < meta.total_pages && (
          <div className="mt-24 text-center">
            <button
              onClick={() => load(selectedCat, meta.page + 1)}
              disabled={loading}
              className="px-12 py-5 bg-white border-2 border-gray-100 rounded-[2rem] text-sm font-bold text-gray-400 hover:border-[#8B7BB4] hover:text-[#8B7BB4] transition-all hover:-translate-y-1 active:translate-y-0 shadow-soft">
              {loading ? 'Discovering...' : 'Discover More Pieces'}
            </button>
          </div>
        )}
      </main>

    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center serif text-2xl animate-pulse">Entering Collection...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
