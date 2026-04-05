'use client';

import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlist, loading } = useWishlist();

  return (
    <div className="bg-bg min-h-screen">
      <Navbar />

      <main className="container-custom pt-8 pb-32">
        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#1A142E] mb-4">
            Your Wishlist
          </h1>
          <p className="text-sm md:text-xl font-medium text-gray-300">
            Keep track of the pieces you love.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-x-8 md:gap-x-12 gap-y-15 md:gap-y-20">
            {wishlist.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
              <span className="text-5xl grayscale opacity-30">💝</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-400 max-w-xs mb-10">
              Explore our collections and tap the heart icon to save items for later.
            </p>
            <Link 
              href="/browse" 
              className="px-10 py-4 bg-[#1A142E] text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all hover:bg-[#8B7BB4] hover:-translate-y-1 shadow-xl"
            >
              Discover Collections
            </Link>
          </div>
        )}
      </main>

    </div>
  );
}
