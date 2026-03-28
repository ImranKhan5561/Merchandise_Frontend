'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { toast } from 'react-toastify';

const STATUS_STEPS = ['pending', 'out_for_delivery', 'delivered'];

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: string;
  image_url?: string;
}

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  total_amount: string;
  status: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_country: string;
  order_items?: OrderItem[];
}

const statusMeta: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:          { label: 'Pending',          color: 'text-yellow-700', bg: 'bg-yellow-100', icon: '🕐' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-blue-700',   bg: 'bg-blue-100',   icon: '🚚' },
  delivered:        { label: 'Delivered',        color: 'text-green-700',  bg: 'bg-green-100',  icon: '✅' },
  cancelled:        { label: 'Cancelled',        color: 'text-red-700',    bg: 'bg-red-100',    icon: '❌' },
};

export default function OrderTrackingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }
    setIsLoggedIn(true);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { ok, data } = await api.orders.list();
    if (ok) setOrders(data);
    setIsLoading(false);
  };

  const handleCancel = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    const { ok, data } = await api.orders.cancel(orderId);
    if (ok) {
      toast.success('Order cancelled.');
      fetchOrders();
    } else {
      toast.error((data as { error?: string })?.error || 'Failed to cancel order.');
    }
  };

  const getStepIndex = (status: string) => STATUS_STEPS.indexOf(status);

  /* ── LOADING ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-purple-50 rounded-full" />
            <div className="h-3 w-28 bg-purple-50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[900px] mx-auto w-full px-4 py-12 md:py-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8B7BB4] mb-2">My Orders</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A142E]">Order Tracking</h1>
        </div>

        {/* Not logged in */}
        {!isLoggedIn && (
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] p-12 text-center shadow-xl shadow-purple-100/30">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#8B7BB4]/60">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <p className="text-[#6B6580] text-sm mb-6">Please log in to view your order history.</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-[#1A142E] text-white py-3 px-10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all"
            >
              Log In
            </button>
          </div>
        )}

        {/* No orders */}
        {isLoggedIn && orders.length === 0 && (
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] p-12 text-center shadow-xl shadow-purple-100/30">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#8B7BB4]/60">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <p className="text-[#6B6580] text-sm mb-6">No orders found. Start your collection today.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#1A142E] text-white py-3 px-10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all"
            >
              Explore Boutique
            </button>
          </div>
        )}

        {/* Order list */}
        {isLoggedIn && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => {
              const meta = statusMeta[order.status] ?? statusMeta['pending'];
              const stepIdx = getStepIndex(order.status);
              const isCancelled = order.status === 'cancelled';
              const isExpanded = expandedId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-lg shadow-purple-100/20 overflow-hidden transition-all"
                >
                  {/* Order header row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-full flex flex-wrap items-center justify-between gap-4 p-7 text-left hover:bg-purple-50/30 transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B7BB4]">
                        {order.order_number}
                      </span>
                      <span className="text-xs text-[#6B6580]">
                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-bold text-[#1A142E]">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${meta.bg} ${meta.color}`}>
                        <span>{meta.icon}</span> {meta.label}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className={`w-4 h-4 text-[#8B7BB4] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </div>
                  </button>

                  {/* Expanded panel */}
                  {isExpanded && (
                    <div className="px-7 pb-7 border-t border-purple-50 space-y-6 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">

                      {/* Progress tracker */}
                      {!isCancelled && (
                        <div className="relative">
                          <div className="flex items-center justify-between relative">
                            {/* connecting line */}
                            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-100 -z-0" />
                            <div
                              className="absolute left-0 top-4 h-0.5 bg-[#8B7BB4] transition-all duration-700 -z-0"
                              style={{ width: stepIdx === 0 ? '0%' : stepIdx === 1 ? '50%' : '100%' }}
                            />
                            {STATUS_STEPS.map((step, i) => {
                              const s = statusMeta[step];
                              const done = i <= stepIdx;
                              return (
                                <div key={step} className="flex flex-col items-center gap-2 z-10">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${done ? 'bg-[#8B7BB4] border-[#8B7BB4] text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                                    {done ? '✓' : <span className="w-2 h-2 rounded-full bg-gray-200 block"/>}
                                  </div>
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${done ? 'text-[#8B7BB4]' : 'text-gray-300'}`}>
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {isCancelled && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-3 text-sm text-red-600 font-medium">
                          ❌ This order was cancelled.
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-3">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-purple-50 rounded-xl overflow-hidden flex-shrink-0">
                                {item.image_url && (
                                  <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-[#1A142E]">{item.product_name}</p>
                                <p className="text-xs text-[#6B6580]">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-[13px] text-[#6B6580] font-medium">${parseFloat(item.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping info */}
                      <div className="bg-purple-50/50 rounded-2xl p-4 text-xs text-[#6B6580] space-y-1">
                        <p className="font-black uppercase tracking-[0.15em] text-[#8B7BB4] text-[9px] mb-2">Shipping To</p>
                        <p className="text-[#1A142E] font-medium">{order.shipping_name}</p>
                        <p>{order.shipping_address}</p>
                        <p>{order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
                        <p>{order.shipping_country}</p>
                      </div>

                      {/* Cancel */}
                      {order.status === 'pending' && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleCancel(order.id)}
                            className="bg-white border border-red-100 text-red-400 py-2.5 px-8 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-500 hover:border-red-200 shadow-sm transition-all"
                          >
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
