'use client';

import Link from 'next/link';
import { ProductCard as ProductCardType } from '../lib/api';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product, index = 0 }: { product: ProductCardType; index?: number }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorited = isInWishlist(product.id);
  // Extract special tags for specific styling
  const isNew = product.tags?.some(t => t.toLowerCase() === 'new arrival');
  const isOnSale = product.on_sale || product.tags?.some(t => t.toLowerCase() === 'on sale');

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full focus:outline-none focus:ring-2 focus:ring-[#8B7BB4] focus:ring-offset-2 rounded-2xl">
      <div className="relative bg-white rounded-2xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden border border-gray-100 flex flex-col h-full">
        
        {/* Modern Gradient Background on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B7BB4]/0 via-[#8B7BB4]/0 to-[#8B7BB4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Floating Badges Layer - Modern Minimalist */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 flex flex-col gap-1">
          {isOnSale && (
            <span className="px-1.5 md:px-2.5 py-0.5 md:py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[8px] md:text-[10px] font-semibold uppercase tracking-wider rounded shadow-sm">
              SALE
            </span>
          )}
          {isNew && (
            <span className="px-1.5 md:px-2.5 py-0.5 md:py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[8px] md:text-[10px] font-semibold uppercase tracking-wider rounded shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button - Modern Glassmorphism */}
        <button 
          className={`absolute top-2 right-2 md:top-4 md:right-4 z-20 w-7 h-7 md:w-9 md:h-9 rounded-full backdrop-blur-sm shadow-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border border-white/50 group/wishlist ${
            isFavorited ? 'bg-[#8B7BB4] text-white' : 'bg-white/80 text-gray-600 hover:bg-[#8B7BB4]'
          }`}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
        >
          <svg viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${
            isFavorited ? 'text-white' : 'text-gray-600 group-hover/wishlist:text-white'
          }`}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Product Image Container - Modern Aspect Ratio */}
        <div className="aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
          {product.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={product.cover_image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
               <div className="text-3xl md:text-5xl grayscale opacity-20">🛍️</div>
            </div>
          )}
          
          {/* Quick Add Overlay - Modern Slide Up */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out z-10">
            <div className="bg-black/80 backdrop-blur-sm py-2 md:py-3 text-center">
              <span className="text-[10px] md:text-xs font-medium text-white uppercase tracking-wider">Quick View</span>
            </div>
          </div>
        </div>

        {/* Content Info - Modern Typography */}
        <div className="p-3 md:p-5">
          {/* Brand & Category Row */}
          <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
             <span className="text-[9px] md:text-[11px] font-medium text-[#8B7BB4] uppercase tracking-wider truncate max-w-[50%]">{product.brand || 'Ethereal'}</span>
             <div className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-gray-300 shrink-0" />
             <span className="text-[9px] md:text-[11px] font-medium text-gray-400 uppercase tracking-wider truncate">{product.category}</span>
          </div>

          {/* Name & Price Row */}
          <div className="flex flex-col mb-2">
             <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-tight line-clamp-2 mb-2 min-h-[2.5rem]">
                {product.name}
             </h3>
             <div className="flex items-baseline gap-2">
                <span className="text-base md:text-xl font-bold text-gray-900">
                  <span className="text-xs md:text-sm align-top">$</span>{product.base_price.toFixed(0)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.base_price && (
                  <span className="text-[10px] md:text-[11px] text-gray-400 line-through font-medium">${product.compare_at_price.toFixed(0)}</span>
                )}
             </div>
          </div>
          
          {/* Tags List - Modern Minimalist */}
          <div className="flex flex-wrap gap-1 md:gap-2 mt-auto">
             {product.tags?.filter(t => t.toLowerCase() !== 'new arrival' && t.toLowerCase() !== 'on sale').slice(0, 1).map(tag => (
               <span key={tag} className="text-[8px] md:text-[10px] font-medium text-gray-500 py-0.5 md:py-1 px-1.5 md:px-2 rounded bg-gray-50 border border-gray-100 transition-all duration-200 group-hover:bg-gray-100 group-hover:border-gray-200 uppercase tracking-wider">
                  {tag}
               </span>
             ))}
          </div>
        </div>

        {/* Modern Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8B7BB4] via-[#8B7BB4]/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </Link>
  );
}