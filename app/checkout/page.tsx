'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get('items');
  const [items, setItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (!itemsParam) {
      toast.error("No items selected for checkout.");
      router.push('/cart');
      return;
    }

    const itemIds = itemsParam.split(',').map(id => parseInt(id, 10));

    Promise.all([
      api.cart.get(),
      api.addresses.list()
    ]).then(([cartRes, addrRes]) => {
      if (cartRes.ok) {
        const cartItems = cartRes.data.items || [];
        const checkoutItems = cartItems.filter((item: any) => itemIds.includes(item.id));
        setItems(checkoutItems);
      }
      if (addrRes.ok) {
        const addressList = addrRes.data?.data?.addresses || [];
        setAddresses(addressList);
        const defaultAddr = addressList.find((a: any) => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (addressList.length > 0) {
          setSelectedAddressId(addressList[0].id);
        }
      }
      setIsLoading(false);
    }).catch(() => {
      toast.error("Failed to load checkout data.");
      setIsLoading(false);
    });
  }, [itemsParam, router]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address.");
      return;
    }

    setIsPlacingOrder(true);
    const itemIds = items.map(item => item.id);
    try {
      const { ok, data } = await api.orders.create(itemIds, selectedAddressId, paymentMethod, orderNotes);
      if (ok) {
        toast.success("Order placed successfully!");
        router.push('/profile'); // Or success page
      } else {
        toast.error(data?.error || "Failed to place order.");
      }
    } catch (err) {
      toast.error("An error occurred while placing the order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#F8F7FF] min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-pulse text-[#8B7BB4] serif text-2xl">Preparing checkout...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F7FF] min-h-screen pb-40 md:pb-32">
      <Navbar />

      <main className="container-custom py-8 md:py-12">
        <h1 className="text-3xl md:text-5xl font-bold serif text-[#1A142E] mb-8 md:mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            {/* Items Summary */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-50 shadow-soft">
              <h3 className="text-xl font-bold font-serif text-[#1A142E] mb-6">Review Items</h3>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                     <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                       <img src={item.image || '/placeholder.png'} alt={item.product_name} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold text-sm text-[#1A142E] truncate">{item.product_name}</h4>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                     </div>
                     <div className="font-bold text-sm text-[#8B7BB4] font-mono">
                        ${(item.price * item.quantity).toFixed(0)}
                     </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Selection */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-50 shadow-soft">
              <h3 className="text-xl font-bold font-serif text-[#1A142E] mb-6">Shipping Address</h3>
              {addresses.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No addresses found. <span className="text-[#8B7BB4] underline cursor-pointer" onClick={() => router.push('/profile')}>Add an address in your profile</span>.
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr: any) => (
                    <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-xl border \${selectedAddressId === addr.id ? 'border-[#8B7BB4] bg-[#8B7BB4]/5' : 'border-gray-100'} cursor-pointer transition-colors`}>
                      <input 
                        type="radio" 
                        name="address" 
                        value={addr.id} 
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-[#8B7BB4] focus:ring-[#8B7BB4]"
                      />
                      <div>
                        <div className="flex gap-2 items-baseline">
                          <p className="font-bold text-sm text-[#1A142E] capitalize">{addr.address_type} Address</p>
                          <p className="text-xs font-bold text-[#8B7BB4]">{addr.full_name}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{addr.address_line_1} {addr.address_line_2}</p>
                        {addr.landmark && <p className="text-xs text-gray-500">Landmark: {addr.landmark}</p>}
                        <p className="text-xs text-gray-500">{addr.city}, {addr.state}, {addr.country} - {addr.postal_code}</p>
                        <p className="text-xs font-medium text-[#1A142E] mt-1">Phone: {addr.phone_number}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-50 shadow-soft">
              <h3 className="text-xl font-bold font-serif text-[#1A142E] mb-6">Payment Method</h3>
              <div className="space-y-4">
                <label className={`flex items-center gap-4 p-4 rounded-xl border \${paymentMethod === 'cod' ? 'border-[#8B7BB4] bg-[#8B7BB4]/5' : 'border-gray-100'} cursor-pointer transition-colors`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod" 
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-[#8B7BB4] focus:ring-[#8B7BB4]"
                  />
                  <span className="font-bold text-sm text-[#1A142E]">Cash on Delivery</span>
                </label>
                <label className={`flex items-center gap-4 p-4 rounded-xl border \${paymentMethod === 'online' ? 'border-[#8B7BB4] bg-[#8B7BB4]/5' : 'border-gray-100'} cursor-pointer transition-colors`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="online" 
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="text-[#8B7BB4] focus:ring-[#8B7BB4]"
                    disabled
                  />
                  <span className="font-bold text-sm text-gray-400">Credit Card (Coming Soon)</span>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-50 shadow-soft">
              <h3 className="text-xl font-bold font-serif text-[#1A142E] mb-4">Order Notes (Optional)</h3>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Any special instructions for delivery..."
                className="w-full bg-white/50 border border-gray-100 rounded-2xl py-4 px-6 text-sm outline-none focus:border-[#8B7BB4] min-h-[100px] resize-none"
              />
            </div>

          </div>

          <div className="lg:col-span-4 sticky top-32">
            <div className="bg-[#8B7BB4] rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 text-white shadow-2xl shadow-purple-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               
               <h2 className="text-xl md:text-2xl font-bold serif mb-6 md:mb-10">Order Summary</h2>
               <div className="space-y-4 md:space-y-6">
                  <div className="flex justify-between items-baseline opacity-80 font-bold text-xs md:text-sm"><span>Items ({items.reduce((s,i) => s + i.quantity, 0)})</span><span>${subtotal.toFixed(0)}</span></div>
                  <div className="flex justify-between items-baseline opacity-80 font-bold text-xs md:text-sm"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping}`}</span></div>
                  <div className="flex justify-between items-center pt-4 md:pt-6 border-t border-white/20">
                     <span className="text-sm md:text-base font-bold">Total</span>
                     <span className="text-3xl md:text-4xl font-black">${total.toFixed(0)}</span>
                  </div>
               </div>

               <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !selectedAddressId}
                  className="w-full bg-white text-[#8B7BB4] py-4 md:py-5 rounded-2xl font-bold text-sm mt-8 md:mt-12 transition-all hover:bg-gray-50 hover:-translate-y-1 shadow-2xl active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {isPlacingOrder ? 'Processing...' : 'Place Order'}
               </button>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
