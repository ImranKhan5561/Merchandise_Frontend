'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { api } from '../lib/api';
import { toast } from 'react-toastify';

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartData, setCartData] = useState<any>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  useEffect(() => {
    fetchCart();
    
    const handleCartChange = () => fetchCart();
    window.addEventListener('cart-change', handleCartChange);
    return () => window.removeEventListener('cart-change', handleCartChange);
  }, []);

  const fetchCart = async () => {
    try {
      const { ok, data } = await api.cart.get();
      if (ok) {
        setCartData(data);
        setItems(data.items || []);
      }
    } catch (err) {
      toast.error("Failed to load cart.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQty = async (variantId: number, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    try {
      const { ok, data } = await api.cart.updateItem(variantId, newQty);
      if (ok) {
        setCartData(data);
        setItems(data.items || []);
      } else {
        toast.error(data.error || "Update failed.");
      }
    } catch (err) {
      toast.error("Error updating cart.");
    }
  };

  const removeItem = async (variantId: number) => {
    try {
      const { ok, data } = await api.cart.removeItem(variantId);
      if (ok) {
        setCartData(data);
        setItems(data.items || []);
        toast.success("Item removed.");
      }
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  const toggleSelection = (itemId: number) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map(item => item.id));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#F8F7FF] min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-pulse text-[#8B7BB4] serif text-2xl">Curating your bag...</div>
        </div>
      </div>
    );
  }

  const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
  const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // No tax for now or add if needed

  return (
    <div className="bg-[#F8F7FF] min-h-screen pb-40 md:pb-32">
      <Navbar />

      <main className="container-custom py-8 md:py-12">
        <h1 className="text-3xl md:text-5xl font-bold serif text-[#1A142E] mb-8 md:mb-12">Shopping Bag</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] py-20 md:py-32 flex flex-col items-center gap-6 md:gap-8 shadow-soft border border-gray-50 px-6 text-center">
             <div className="text-5xl md:text-6xl">🛍️</div>
             <p className="serif text-2xl md:text-3xl font-bold text-gray-200">Your bag is weightless.</p>
             <Link href="/browse" className="bg-[#1A142E] text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]">Discover Pieces</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
                    {/* List */}
            <div className="lg:col-span-8 space-y-4 md:space-y-6">
              
              <div className="bg-white rounded-[2rem] p-4 flex items-center justify-between border border-gray-50 shadow-soft">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedItemIds.length === items.length && items.length > 0} 
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-[#8B7BB4] focus:ring-[#8B7BB4]"
                  />
                  <span className="font-bold text-sm text-[#1A142E]">Select All ({items.length} items)</span>
                </label>
                {selectedItemIds.length > 0 && (
                  <span className="text-sm font-bold text-[#8B7BB4]">{selectedItemIds.length} item(s) selected</span>
                )}
              </div>

              {items.map(item => (
                <div key={item.id} className="bg-white rounded-[2rem] md:rounded-[3rem] p-4 md:p-6 flex flex-row gap-4 md:gap-8 items-center border border-gray-50 shadow-soft transition-all hover:shadow-2xl group relative overflow-hidden">
                  
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
                    <input 
                      type="checkbox" 
                      checked={selectedItemIds.includes(item.id)} 
                      onChange={() => toggleSelection(item.id)}
                      className="w-5 h-5 md:w-6 md:h-6 rounded-md border-gray-300 text-[#8B7BB4] shadow-sm focus:ring-[#8B7BB4] cursor-pointer"
                    />
                  </div>

                  <Link href={`/products/${item.product_slug}`} className="w-24 h-32 md:w-32 md:h-44 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-gray-50 flex-shrink-0 block ml-6 md:ml-8">
                    <img src={item.image || '/placeholder.png'} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </Link>
                  
                  <div className="flex-1 flex flex-col justify-between py-1 md:py-2 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                       <div className="min-w-0">
                        <Link href={`/products/${item.product_slug}`}>
                          <h3 className="text-lg md:text-xl font-bold text-[#1A142E] mb-1 hover:text-[#8B7BB4] transition-colors truncate">{item.product_name}</h3>
                        </Link>
                          <div className="flex gap-2 flex-wrap">
                            {item.options?.map((opt: any) => (
                              <p key={opt.name} className="text-[9px] md:text-[10px] uppercase font-black text-gray-300 tracking-widest">
                                {opt.name}: {opt.value}
                              </p>
                            ))}
                          </div>
                       </div>
                       <button onClick={() => removeItem(item.variant_id)} className="text-gray-200 hover:text-red-400 transition-colors flex-shrink-0 mt-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 md:w-5 md:h-5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                       </button>
                    </div>

                    <div className="flex items-center justify-between mt-4 md:mt-8">
                       <span className="text-xl md:text-2xl font-black text-[#8B7BB4]">${item.price.toFixed(0)}</span>
                       <div className="flex items-center gap-4 md:gap-6 bg-gray-50 rounded-[1.2rem] md:rounded-[1.5rem] px-3 md:px-5 py-1.5 md:py-2 border border-gray-100">
                          <button onClick={() => updateQty(item.variant_id, item.quantity, -1)} className="text-lg md:text-xl font-light text-gray-400 hover:text-[#1A142E] transition-colors">-</button>
                          <span className="text-xs md:text-sm font-black w-4 md:w-6 text-center text-[#1A142E]">{item.quantity}</span>
                          <button onClick={() => updateQty(item.variant_id, item.quantity, 1)} className="text-lg md:text-xl font-light text-gray-400 hover:text-[#1A142E] transition-colors">+</button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-4 sticky top-32">
              <div className="bg-[#8B7BB4] rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 text-white shadow-2xl shadow-purple-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                 
                 <h2 className="text-2xl md:text-3xl font-bold serif mb-6 md:mb-10">Order Total</h2>
                 <p className="text-sm opacity-80 mb-6">{selectedItemIds.length} item(s) selected</p>
                 <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-baseline opacity-80 font-bold text-xs md:text-sm"><span>Subtotal</span><span>${subtotal.toFixed(0)}</span></div>
                    <div className="flex justify-between items-baseline opacity-80 font-bold text-xs md:text-sm"><span>Shipping</span><span>{subtotal > 50 || subtotal === 0 ? 'FREE' : '$5'}</span></div>
                    <div className="flex justify-between items-center pt-4 md:pt-6 border-t border-white/20">
                       <span className="text-sm md:text-base font-bold">Total Bag</span>
                       <span className="text-3xl md:text-4xl font-black">${(total + (subtotal > 50 || subtotal === 0 ? 0 : 5)).toFixed(0)}</span>
                    </div>
                 </div>

                 {selectedItemIds.length > 0 ? (
                   <Link href={`/checkout?items=${selectedItemIds.join(',')}`} className="w-full bg-white text-[#8B7BB4] py-4 md:py-5 rounded-2xl font-bold text-sm mt-8 md:mt-12 transition-all hover:bg-gray-50 hover:-translate-y-1 shadow-2xl active:translate-y-0 text-center block">
                      Checkout Selected Items
                   </Link>
                 ) : (
                   <button disabled className="w-full bg-white/50 text-[#8B7BB4]/50 py-4 md:py-5 rounded-2xl font-bold text-sm mt-8 md:mt-12 cursor-not-allowed text-center block">
                      Select Items to Checkout
                   </button>
                 )}

                 <Link href={`/checkout?items=${items.map(i => i.id).join(',')}`} className="w-full bg-transparent border border-white text-white py-4 md:py-5 rounded-2xl font-bold text-sm mt-4 transition-all hover:bg-white/10 hover:-translate-y-1 active:translate-y-0 text-center block">
                    Checkout All Items
                 </Link>
                 
                 <div className="mt-6 md:mt-8 flex justify-center gap-4 md:gap-6 grayscale opacity-40">
                   {['VISA', 'MC', 'AMEX'].map(c => <span key={c} className="text-[9px] md:text-[10px] font-black tracking-widest">{c}</span>)}
                 </div>
              </div>
            </div>

          </div>
        )}
      </main>

    </div>
  );
}
