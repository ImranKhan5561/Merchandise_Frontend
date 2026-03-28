import { api } from './lib/api';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProductCard from './components/ProductCard';
import SortDropdown from './components/SortDropdown';
import FeaturedSection from './components/FeaturedSection';
import DiscoveryCategories from './components/DiscoveryCategories';
import DiscoverMoreSection from './components/DiscoverMoreSection';
import Link from 'next/link';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams;

  const [popularRes, categoriesRes] = await Promise.all([
    api.products.list({ per_page: 6, featured: 'true' }),
    api.categories.list(),
  ]);

  const featuredProducts = popularRes.data?.products || [];
  const allCats = categoriesRes.data || [];

  return (
    <div className="bg-bg min-h-screen">
      <Navbar />

      <main className="container-custom">
        
        {/* ── HERO HEADER & CATEGORIES ── */}
        <section className="pt-8 md:pt-12 pb-7 md:pb-10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-5xl font-semibold tracking-tight text-[#1A142E]">
              Discover
            </h1>
            <SortDropdown />
          </div>
          <p className="text-sm md:text-xl font-medium text-gray-300 max-w-xsm md:max-w-xl mb-6">
            Discover Products of your <span className="text-[#8B7BB4]">interest</span> from our curated collection.
          </p>
          
          <DiscoveryCategories categories={allCats} />
        </section>

        <FeaturedSection 
          initialProducts={featuredProducts} 
          categories={allCats} 
        />

        {/* ── FULL-WIDTH ARTISAN HERO ── */}
        <section className="pb-32">
           <div className="relative h-[700px] rounded-[5rem] overflow-hidden group shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=2400&auto=format&fit=crop" 
                alt="Artisan Collection"
                className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute inset-x-16 lg:inset-x-32 inset-y-0 flex flex-col justify-center max-w-4xl text-white">
                 <p className="text-[10px] font-black uppercase tracking-[0.5rem] mb-10 opacity-60">Spring Drop 2024</p>
                 <h2 className="text-7xl lg:text-9xl font-bold leading-[0.95] mb-12 tracking-tight">
                    The Artisan <br /> Collection
                 </h2>
                 <p className="text-xl font-medium opacity-70 mb-14 leading-relaxed max-w-xl">
                    Experience the synergy of tradition and modern aesthetics. Each piece is hand-crafted with precision.
                 </p>
                 <Link href="/browse" className="inline-block px-14 py-6 bg-white text-[#1A142E] rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-gray-100 hover:-translate-y-1 hover:shadow-2xl w-fit active:translate-y-0">
                    Discover Collection
                 </Link>
              </div>
           </div>
        </section>

        {/* ── DISCOVER MORE (Infinite Scroll & Filters) ── */}
        <DiscoverMoreSection 
          categories={allCats} 
          initialSort={sort}
        />

      </main>

      {/* Footer Expanded */}
      <footer className="bg-white border-t border-gray-50 pt-32 pb-20">
         <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20 items-start mb-24">
               <div className="md:col-span-1">
                  <h3 className="text-3xl font-black tracking-tighter text-[#1A142E] mb-6">Ethereal</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                     Curated luxury essentials from around the world. We believe in the weightless beauty of mindful fashion.
                  </p>
               </div>
               <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A142E] mb-4">Explore</h4>
                  {['Discover', 'Artisans', 'Collections', 'Drops'].map(l => (
                    <Link key={l} href="#" className="text-gray-400 hover:text-[#8B7BB4] transition-all text-sm font-medium">{l}</Link>
                  ))}
               </div>
               <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A142E] mb-4">Support</h4>
                  {['Shipping', 'Returns', 'Privacy', 'Contact'].map(l => (
                    <Link key={l} href="#" className="text-gray-400 hover:text-[#8B7BB4] transition-all text-sm font-medium">{l}</Link>
                  ))}
               </div>
            </div>
            <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">© 2024 Ethereal Boutique. All rights reserved.</p>
               <div className="flex gap-8">
                  {['Instagram', 'Pinterest', 'Twitter'].map(link => (
                    <Link key={link} href="#" className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] hover:text-[#8B7BB4] transition-all">
                       {link}
                    </Link>
                  ))}
               </div>
            </div>
         </div>
      </footer>

      <BottomNav />
    </div>
  );
}
