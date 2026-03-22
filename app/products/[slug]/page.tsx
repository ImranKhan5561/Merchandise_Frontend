'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ProductDetail, OptionValue } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { use } from 'react';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>({});
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.products.show(slug).then(p => {
      setProduct(p);
      setLoading(false);
      const defaults: Record<number, number> = {};
      p.option_types.forEach(ot => { if (ot.values[0]) defaults[ot.id] = ot.values[0].id; });
      setSelectedValues(defaults);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-20 text-center serif text-2xl text-gray-300 animate-pulse">Loading Ethereal...</div>;
  if (!product) return <div className="p-20 text-center serif text-2xl">Boutique Item Not Found.</div>;

  return (
    <div className="bg-white min-h-screen pb-20">
      <Navbar />

      <main className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* ── IMAGES (Left 7 cols) ── */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative rounded-[3rem] overflow-hidden bg-gray-50 aspect-[4/5] shadow-2xl group">
               {product.images[0] && (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
               )}
               <button className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-xl flex items-center justify-center text-[#8B7BB4] transition-all hover:scale-110">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                   <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                 </svg>
               </button>
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto scrollbar-none">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-24 h-32 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all p-0.5 ${i === imgIdx ? 'border-[#8B7BB4] scale-105' : 'border-transparent opacity-60'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>
          </div>

          {/* ── INFO (Right 5 cols) ── */}
          <div className="lg:col-span-5 pt-4">
             <nav className="flex gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-6">
                <Link href="/" className="hover:text-[#8B7BB4]">Discover</Link>
                <span>/</span>
                <span className="text-gray-400">{product.category?.name}</span>
             </nav>

             <h1 className="text-5xl font-bold serif text-[#1A142E] mb-4 leading-tight">{product.name}</h1>
             
             <div className="flex items-center gap-6 mb-8">
                <span className="text-3xl font-black text-[#8B7BB4]">${product.base_price.toFixed(0)}</span>
                <div className="flex items-center gap-1.5 border-l border-gray-100 pl-6">
                   <div className="flex text-yellow-400 text-xs">★★★★★</div>
                   <span className="text-[10px] font-bold text-gray-400">4.9 (120 REVIEWS)</span>
                </div>
             </div>

             <p className="text-gray-500 font-medium leading-relaxed mb-10">
               {product.description || "A masterfully crafted piece from our Artisan Collection, balancing weightless luxury with contemporary silhouettes."}
             </p>

             {/* Options */}
             <div className="space-y-10 mb-12">
               {product.option_types.map(ot => (
                 <div key={ot.id}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A142E] mb-4">Choose {ot.presentation}</h3>
                    <div className="flex flex-wrap gap-3">
                       {ot.values.map(ov => (
                         <button key={ov.id}
                           onClick={() => setSelectedValues(p => ({ ...p, [ot.id]: ov.id }))}
                           className={`px-8 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${selectedValues[ot.id] === ov.id ? 'bg-[#8B7BB4] text-white border-[#8B7BB4] shadow-lg shadow-purple-100' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}>
                           {ov.presentation}
                         </button>
                       ))}
                    </div>
                 </div>
               ))}
             </div>

             {/* CTA */}
             <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 2000); }}
                  className="flex-1 bg-[#1A142E] text-white py-5 rounded-2xl font-bold text-sm transition-all hover:bg-black hover:-translate-y-1 shadow-xl">
                  {added ? 'Added to Bag ✓' : `Add To Bag — $${product.base_price.toFixed(0)}`}
                </button>
                <button className="w-16 h-16 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-[#8B7BB4] hover:text-[#8B7BB4] transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
             </div>

             {/* Badges */}
             <div className="grid grid-cols-3 gap-4 mt-12 pt-12 border-t border-gray-50">
               {[
                 { label: 'Ethereal Silk', icon: '✨' },
                 { label: 'Artisan Made', icon: '🎨' },
                 { label: 'Free Shipping', icon: '🚚' }
               ].map(b => (
                 <div key={b.label} className="text-center">
                    <div className="text-xl mb-2">{b.icon}</div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{b.label}</p>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
