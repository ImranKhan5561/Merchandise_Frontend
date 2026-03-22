import Link from 'next/link';
import { ProductCard as ProductCardType } from '../lib/api';

export default function ProductCard({ product, index = 0 }: { product: ProductCardType; index?: number }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-[2.5rem] p-5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative border border-gray-50">
        
        {/* Floating Wishlist */}
        <button className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                onClick={e => e.preventDefault()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[#8B7BB4]">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Product Image */}
        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-50 mb-4 flex items-center justify-center">
          {product.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.cover_image} alt={product.name} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
             <div className="text-4xl opacity-10">🛍️</div>
          )}
        </div>

        {/* Info */}
        <div className="px-2">
          <div className="flex justify-between items-start mb-1">
             <h3 className="text-base font-bold text-[#1A142E] truncate pr-4">{product.name}</h3>
             <span className="text-base font-bold text-[#8B7BB4]">${product.base_price.toFixed(0)}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
             <div className="flex text-yellow-400">
                {[1,2,3,4,5].map(s => <span key={s} className="text-[10px]">★</span>)}
             </div>
             <span className="text-[10px] font-bold text-gray-400">4.8 (120 reviews)</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
