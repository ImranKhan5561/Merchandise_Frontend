'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductDetail, Variant, api } from '../lib/api';
import Link from 'next/link';
import InnerImageContainer from './InnerImageContainer';
import { toast } from 'react-toastify';

interface ProductDetailViewProps {
  product: ProductDetail;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  // Option selection state: { [optionTypeId]: optionValueId }
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>(() => {
    // Initialize with first available option values
    const initial: Record<number, number> = {};
    product.option_types.forEach(ot => {
      if (ot.values.length > 0) {
        initial[ot.id] = ot.values[0].id;
      }
    });
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Find the variant that matches all selected options
  const activeVariant = useMemo(() => {
    return product.variants.find(v => 
      v.option_value_ids.every(id => Object.values(selectedOptions).includes(id)) &&
      Object.keys(selectedOptions).length === v.option_value_ids.length
    ) || product.variants[0]; // Fallback to first variant if no match (shouldn't happen with correct data)
  }, [product.variants, selectedOptions]);

  // Combine product multi-images and variant image
  const allImages = useMemo(() => {
    if (activeVariant?.images?.length && activeVariant.images.length > 0) {
      return activeVariant.images;
    }
    return product.images;
  }, [product.images, activeVariant]);

  const currentPrice = activeVariant?.price || product.base_price;
  const originalPrice = product.compare_at_price;
  const discount = product.on_sale ? Math.round(((originalPrice! - currentPrice) / originalPrice!) * 100) : null;

  const handleOptionChange = (optionTypeId: number, optionValueId: number) => {
    setSelectedOptions(prev => ({ ...prev, [optionTypeId]: optionValueId }));
  };

  const handleAddToCart = async () => {
    if (!activeVariant) return;
    
    setIsAdding(true);
    try {
      await api.cart.addItem(activeVariant.id, quantity);
      toast.success(`"${product.name}" added to bag!`, {
        icon: <span>🛍️</span>,
        style: { borderRadius: '1rem', fontWeight: 'bold' }
      });
    } catch (err) {
      console.error('Failed to add to cart:', err);
      toast.error('Please login to add items to your cart.', {
        style: { borderRadius: '1rem', fontWeight: 'bold' }
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start max-w-7xl mx-auto px-4 py-8">
      
      {/* ── LEFT: IMAGE GALLERY (Vertical Thumbnails) ── */}
      <div className="w-full lg:w-1/2 flex gap-4 lg:gap-6">
        {/* Thumbnails - Modern Minimalist */}
        <div className="hidden md:flex flex-col gap-3 max-h-[600px] overflow-y-auto scrollbar-none pr-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`w-20 h-24 rounded-xl overflow-hidden transition-all duration-300 flex-shrink-0 bg-gray-50 ${
                activeImageIndex === idx 
                  ? 'ring-2 ring-[#8B7BB4] ring-offset-2 scale-105 shadow-lg' 
                  : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Main Image with Modern Zoom Effect */}
        <div className="flex-1 aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 shadow-xl relative group">
           <InnerImageContainer src={allImages[activeImageIndex]} alt={product.name} />
           
           {/* Modern Badges */}
           <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
              {product.on_sale && discount && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-lg backdrop-blur-sm">
                  {discount}% OFF
                </span>
              )}
              {product.tags?.includes('New Arrival') && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-lg backdrop-blur-sm">
                  NEW
                </span>
              )}
           </div>

           {/* Zoom indicator on hover */}
           <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-sm rounded-full p-2">
             <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
             </svg>
           </div>
        </div>
      </div>

      {/* ── RIGHT: PRODUCT INFO ── */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Header with Close Button */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
             <span className="text-sm font-semibold text-[#8B7BB4] uppercase tracking-wider">{product.brand || 'Ethereal'}</span>
             <div className="w-1 h-1 rounded-full bg-gray-300" />
             <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">{product.category?.name}</span>
          </div>
          <Link href="/" className="p-2 text-gray-400 hover:text-[#1A142E] transition-all hover:bg-gray-100 rounded-full">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
          {product.name}
        </h1>

        {/* Rating Section - Modern */}
        <div className="flex items-center gap-3 mb-6">
           <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s, i) => (
                <svg key={s} className={`w-4 h-4 ${i < 4 ? 'text-amber-400' : 'text-gray-200'} fill-current`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs font-medium text-gray-500 ml-2">(124 reviews)</span>
           </div>
        </div>

        {/* Price Section - Modern */}
        <div className="flex items-center gap-6 mb-8 p-4 bg-gray-50 rounded-2xl">
           <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                <span className="text-xl align-top">$</span>{currentPrice.toFixed(0)}
              </span>
              {originalPrice && originalPrice > currentPrice && (
                <span className="text-lg text-gray-400 line-through font-medium">${originalPrice.toFixed(0)}</span>
              )}
           </div>
           
           <div className="h-8 w-px bg-gray-200" />
           
           <div className="text-sm font-medium">
              {activeVariant?.stock! > 0 ? (
                <span className="text-emerald-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  In Stock ({activeVariant?.stock} items)
                </span>
              ) : (
                <span className="text-red-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Out of Stock
                </span>
              )}
           </div>
        </div>

        {/* Description - Modern Typography */}
        <div className="mb-10">
          <p className="text-gray-600 leading-relaxed">
            {product.description || "A masterfully crafted piece designed for the modern individual. Experience the harmony of traditional techniques and contemporary aesthetics."}
          </p>
        </div>

        {/* ── VARIANTS / OPTIONS ── Modern Chips */}
        <div className="space-y-8 mb-10">
          {product.option_types.map(ot => (
            <div key={ot.id}>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">{ot.name}</h4>
              <div className="flex flex-wrap gap-3">
                {ot.values.map((ov) => {
                  const isSelected = selectedOptions[ot.id] === ov.id;
                  return (
                    <button
                      key={ov.id}
                      onClick={() => handleOptionChange(ot.id, ov.id)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gray-900 text-white shadow-md scale-105' 
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-400 hover:shadow-sm'
                      }`}
                    >
                      {ov.presentation || ov.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── SHIPPING INFO ── Modern Card */}
        {product.free_shipping && (
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 mb-10 border border-gray-100 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-900/5 flex items-center justify-center text-xl">🚚</div>
                <div className="flex-1">
                   <p className="text-sm font-semibold text-gray-900 mb-0.5">Free Shipping</p>
                   <p className="text-xs text-gray-500">Estimated delivery in 2-3 business days</p>
                </div>
             </div>
          </div>
        )}

        {/* ── ACTIONS ── Modern Controls */}
        <div className="flex items-center gap-4 mb-8">
           <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors font-medium"
                disabled={quantity <= 1}
              >−</button>
              <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => Math.min(activeVariant?.stock || 99, q + 1))}
                className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors font-medium"
              >+</button>
           </div>
           
            <button 
              onClick={handleAddToCart}
              disabled={isAdding || activeVariant?.stock === 0}
              className="flex-1 h-14 bg-[#1A142E] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-black hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 shadow-lg flex items-center justify-center gap-3"
            >
              {isAdding ? (
                 <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                'Add to Cart'
              )}
            </button>
        </div>

        {/* Action Buttons - Modern Minimalist */}
        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
           <button className="group flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Wishlist
           </button>
           <button className="group flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Compare
           </button>
        </div>
      </div>
    </div>
  );
}