'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useRouter } from 'next/navigation';
import { useWishlist } from '../context/WishlistContext';
import CategoryMegaMenu from './CategoryMegaMenu';

export default function Navbar({ title = 'Ethereal' }: { title?: string }) {
  const { wishlist } = useWishlist();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      if (token) {
        fetchCartCount();
      } else {
        setCartCount(0);
      }
    };

    const fetchCartCount = async () => {
      try {
        const { ok, data } = await api.cart.get();
        if (ok && data.items) {
          const count = data.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
          setCartCount(count);
        }
      } catch {
        console.error('Failed to fetch cart count');
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('cart-change', fetchCartCount);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('cart-change', fetchCartCount);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* ── TOP BAR ── */}
      <div className="bg-[#F5F5F5] border-b border-gray-200">
        <div className="container-custom flex items-center justify-between h-9">
          {/* Announcement — hidden on mobile to avoid overflow */}
          <p className="hidden sm:block text-[11.5px] text-[#555] font-normal tracking-wide">
            Get up to 50% off on selected items,{' '}
            <strong className="font-bold text-[#1A142E]">limited time only</strong>
          </p>
          {/* Utility links — always visible */}
          <div className="flex items-center gap-4 sm:gap-5 text-[11px] sm:text-[11.5px] font-medium text-[#555] ml-auto">
            <Link href="/help" className="hover:text-[#1A142E] transition-colors whitespace-nowrap">
              Help Center
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/orders/track" className="text-purple-500 font-bold hover:text-[#1A142E] transition-colors whitespace-nowrap">
              Order Tracking
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN BAR ── */}
      <nav className="bg-white border-b border-gray-100">
        <div className="container-custom flex items-center gap-4 sm:gap-8 h-[62px] sm:h-[78px]">

          {/* Logo — matches reference closely */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <svg viewBox="0 0 48 48" className="w-[34px] h-[34px] sm:w-[46px] sm:h-[46px] flex-shrink-0" fill="none">
              <path d="M6 10h5l6 22h18l5-15H15" stroke="#C8382A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="20" cy="37" r="3" fill="#C8382A" />
              <circle cx="35" cy="37" r="3" fill="#C8382A" />
              <path d="M18 16h14M15 21h17M13 26h19" stroke="#C8382A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            </svg>
            <div className="leading-[1.15]">
              <div className="text-[16px] sm:text-[20px] font-black tracking-[0.06em] text-[#1A142E] uppercase">{title}</div>
              <div className="text-[8px] sm:text-[9.5px] font-semibold tracking-[0.22em] text-[#8B7BB4] uppercase">Boutique Store</div>
            </div>
          </Link>

          {/* Search bar — desktop only */}
          <form onSubmit={handleSearch} className="flex-1 max-w-[580px] relative hidden md:flex">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full bg-[#F7F7F7] border border-gray-200 rounded-[6px] py-[11px] pl-5 pr-14 text-[13px] text-gray-700 placeholder:text-gray-400 focus:bg-white focus:border-[#C8A2C8] focus:shadow-sm focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-[#8B7BB4] transition-colors flex items-center border-l border-gray-200 rounded-r-[6px]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[15px] h-[15px]">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </form>

          {/* Right-side actions */}
          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0 ml-auto">

            {/* Login / Register or profile */}
            {isLoggedIn ? (
              <Link href="/profile" className="text-[#555] hover:text-[#C8382A] transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[24px] h-[24px]">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-[11px] sm:text-[13px] text-[#555]">
                <Link href="/login" className="hover:text-[#C8382A] transition-colors font-medium">Login</Link>
                <span className="text-gray-300">|</span>
                <Link href="/register" className="hover:text-[#C8382A] transition-colors font-medium">Register</Link>
              </div>
            )}

            {/* Wishlist — badge only when count > 0 */}
            <Link href="/wishlist" className="relative text-gray-500 hover:text-[#C8382A] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[24px] h-[24px]">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full bg-[#8B7BB4] text-[8px] font-black text-white flex items-center justify-center border border-white px-0.5 animate-in zoom-in duration-200">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart — badge only when cartCount > 0 */}
            <Link href="/cart" className="relative text-gray-500 hover:text-[#C8382A] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[24px] h-[24px]">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full bg-[#C8382A] text-[8px] font-black text-white flex items-center justify-center border border-white px-0.5 animate-in zoom-in duration-200">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── CATEGORY MEGA MENU ── */}
      <CategoryMegaMenu />
    </header>
  );
}
