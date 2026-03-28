'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, ProductCard as ProductCardType, Category } from '../lib/api';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
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
    api.categories.list().then(r => setCategories(r.data || [])).catch(() => {});
    load(selectedCat, 1);
  }, [selectedCat, load]);

  const allCats = categories.flatMap(c => [c, ...c.children]);

  return (
    <div className="bg-[#FDFBFF] min-h-screen">
      <Navbar />

      <main className="container-custom py-12">
        <header className="mb-12">
           <h1 className="text-5xl font-bold serif text-[#1A142E] mb-2">Collections</h1>
           <p className="text-[#6B6580] font-medium">Browse through our curated artisan pieces</p>
        </header>

        {/* Filters Top Bar */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-center mb-12">
           <div className="flex gap-3 overflow-x-auto scrollbar-none w-full lg:w-auto">
              <button
                onClick={() => router.push('/browse')}
                className={`flex-shrink-0 px-8 py-3 rounded-2xl text-xs font-bold transition-all ${!selectedCat ? 'bg-[#8B7BB4] text-white shadow-xl shadow-purple-100' : 'bg-white text-gray-400 border border-gray-100'}`}>
                All Pieces
              </button>
              {allCats.map(cat => (
                <button key={cat.id}
                  onClick={() => router.push(`/browse?category_id=${cat.id}`)}
                  className={`flex-shrink-0 px-8 py-3 rounded-2xl text-xs font-bold transition-all ${selectedCat === String(cat.id) ? 'bg-[#8B7BB4] text-white shadow-xl shadow-purple-100' : 'bg-white text-gray-400 border border-gray-100'}`}>
                  {cat.name}
                </button>
              ))}
           </div>

           <div className="flex gap-4 w-full lg:w-auto">
              <div className="flex-1 lg:w-64 relative group">
                 <input type="text" placeholder="Search..." className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold focus:border-[#8B7BB4] outline-none transition-all shadow-soft" />
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
              <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl flex items-center gap-2 text-xs font-bold text-gray-400 transition-all hover:border-gray-300">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M4 21v-7m0-4V3m8 18v-11m0-4V3m8 18v-3m0-4V3M1 14h6m2-10h6m2 14h6"/></svg>
                 <span>Filter</span>
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

      <BottomNav />
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
