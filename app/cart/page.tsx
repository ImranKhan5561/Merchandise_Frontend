'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import Link from 'next/link';

interface CartItem {
  id: number;
  name: string;
  variant: string;
  price: number;
  qty: number;
  image?: string;
}

const DEMO_ITEMS: CartItem[] = [
  { id: 1, name: 'Linen Blend Blazer', variant: 'Oatmeal / Medium', price: 245, qty: 1, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200&auto=format&fit=crop' },
  { id: 2, name: 'Ceramic Studio Vase', variant: 'Matte White / Large', price: 85, qty: 2, image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=200&auto=format&fit=crop' },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(DEMO_ITEMS);

  const updateQty = (id: number, delta: number) => {
    setItems(prev => prev
      .map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
      .filter(i => i.qty > 0)
    );
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + (subtotal * 0.08);

  return (
    <div className="bg-[#F8F7FF] min-h-screen pb-32">
      <Navbar />

      <main className="container-custom py-12">
        <h1 className="text-5xl font-bold serif text-[#1A142E] mb-12">Shopping Bag</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-[3.5rem] py-32 flex flex-col items-center gap-8 shadow-soft border border-gray-50">
             <div className="text-6xl text-gray-100">🛍️</div>
             <p className="serif text-3xl font-bold text-gray-200">Your bag is weightless.</p>
             <Link href="/browse" className="btn-primary">Discover Pieces</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* List */}
            <div className="lg:col-span-8 space-y-6">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-[3rem] p-6 flex gap-8 items-center border border-gray-50 shadow-soft transition-all hover:shadow-2xl group">
                  <div className="w-32 h-44 rounded-[2rem] overflow-hidden bg-gray-50 flex-shrink-0">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="text-xl font-bold text-[#1A142E] mb-1">{item.name}</h3>
                          <p className="text-[10px] uppercase font-black text-gray-300 tracking-widest">{item.variant}</p>
                       </div>
                       <button onClick={() => updateQty(item.id, -item.qty)} className="text-gray-200 hover:text-red-400 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                       </button>
                    </div>

                    <div className="flex items-end justify-between mt-8">
                       <span className="text-2xl font-black text-[#8B7BB4]">${item.price.toFixed(0)}</span>
                       <div className="flex items-center gap-6 bg-gray-50 rounded-[1.5rem] px-5 py-2 border border-gray-100">
                          <button onClick={() => updateQty(item.id, -1)} className="text-xl font-light text-gray-400 hover:text-[#1A142E] transition-colors">-</button>
                          <span className="text-sm font-black w-6 text-center text-[#1A142E]">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="text-xl font-light text-gray-400 hover:text-[#1A142E] transition-colors">+</button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-4 sticky top-32">
              <div className="bg-[#8B7BB4] rounded-[3.5rem] p-10 text-white shadow-2xl shadow-purple-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                 
                 <h2 className="text-3xl font-bold serif mb-10">Order Total</h2>
                 <div className="space-y-6">
                    <div className="flex justify-between items-baseline opacity-80 font-bold text-sm"><span>Subtotal</span><span>${subtotal.toFixed(0)}</span></div>
                    <div className="flex justify-between items-baseline opacity-80 font-bold text-sm"><span>Shipping</span><span>FREE</span></div>
                    <div className="flex justify-between items-center pt-6 border-t border-white/20">
                       <span className="text-base font-bold">Total Bag</span>
                       <span className="text-4xl font-black">${total.toFixed(0)}</span>
                    </div>
                 </div>

                 <button className="w-full bg-white text-[#8B7BB4] py-5 rounded-2xl font-bold text-sm mt-12 transition-all hover:bg-gray-50 hover:-translate-y-1 shadow-2xl active:translate-y-0">
                    Secure Checkout
                 </button>
                 
                 <div className="mt-8 flex justify-center gap-6 grayscale opacity-40">
                   {['VISA', 'MC', 'AMEX'].map(c => <span key={c} className="text-[10px] font-black tracking-widest">{c}</span>)}
                 </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
