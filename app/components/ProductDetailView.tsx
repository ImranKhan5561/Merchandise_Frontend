'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ProductDetail, Variant, api, ProductCard as ProductCardType } from '../lib/api';
import { useWishlist } from '../context/WishlistContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import InnerImageContainer from './InnerImageContainer';
import { toast } from 'react-toastify';

interface ProductDetailViewProps {
  product: ProductDetail;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const sliderRef = useRef<HTMLDivElement>(null);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorited = isInWishlist(product.id);
  const [isAdding, setIsAdding] = useState(false);

  // Option selection state: { [optionTypeId]: optionValueId }
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    // Initialize from the first non-master variant that has option values
    const defaultVariant = product.variants.find(v => !v.is_master && v.option_value_ids.length > 0)
      || product.variants[0];
    if (defaultVariant?.option_value_ids.length > 0) {
      product.option_types.forEach(ot => {
        const matchingValue = ot.values.find(v => defaultVariant.option_value_ids.includes(v.id));
        if (matchingValue) initial[ot.id] = matchingValue.id;
      });
    }
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Find the variant that matches ALL currently selected options
  const activeVariant = useMemo(() => {
    const selectionValues = Object.values(selectedOptions);
    if (selectionValues.length === 0) {
      return product.variants.find(v => v.is_master) || product.variants[0];
    }
    return product.variants.find(v =>
      selectionValues.every(id => v.option_value_ids.includes(id)) &&
      v.option_value_ids.length === selectionValues.length
    ) || product.variants.find(v => v.is_master) || product.variants[0];
  }, [product.variants, selectedOptions]);

  // Amazon-style image logic:
  // 1. No variant system → show product images
  // 2. Active variant has images → show those
  // 3. Active variant has no images → find a partial-match variant with images (e.g. same color)
  // 4. Fallback to product images
  const allImages = useMemo(() => {
    const hasVariantsWithOptions = product.variants.some(v => v.option_value_ids.length > 0);

    if (!hasVariantsWithOptions) {
      return product.images || [];
    }

    // Active variant has images? Use those.
    const variantImages = activeVariant?.images || [];
    if (variantImages.length > 0) return variantImages;

    // Try to find a variant that shares at least ONE of the selected option values and has images
    // Priority: most matching option values first
    const selectionValues = Object.values(selectedOptions);
    const partialMatch = product.variants
      .filter(v => v.images?.length > 0 && v.option_value_ids.some(id => selectionValues.includes(id)))
      .sort((a, b) => {
        const aMatches = a.option_value_ids.filter(id => selectionValues.includes(id)).length;
        const bMatches = b.option_value_ids.filter(id => selectionValues.includes(id)).length;
        return bMatches - aMatches;
      })[0];

    if (partialMatch) return partialMatch.images;

    return product.images || [];
  }, [product.images, product.variants, activeVariant, selectedOptions]);

  // Availability-aware option filtering:
  // A value is available if there exists at least one variant containing it
  // that is ALSO compatible with ALL currently selected VISUAL options
  // (except itself if it is a visual option).
  // Non-visual options (storage, RAM) are just required to coexist with the visual selections.
  const availableValueIds = useMemo(() => {
    const available = new Set<number>();

    // Identify ALL visual option types
    const visualOts = product.option_types.filter(ot => ot.is_visual);

    product.option_types.forEach(ot => {
      ot.values.forEach(ov => {
        // Find other selected visual IDs (excluding the current option type being checked)
        const otherVisualIds = visualOts
          .filter(vot => vot.id !== ot.id)
          .map(vot => selectedOptions[vot.id])
          .filter(Boolean) as number[];

        const hasVariant = product.variants.some(v => {
          if (!v.option_value_ids.includes(ov.id)) return false;
          // Must match all other selected visual options
          return otherVisualIds.every(id => v.option_value_ids.includes(id));
        });

        if (hasVariant) available.add(ov.id);
      });
    });
    return available;
  }, [product.variants, product.option_types, selectedOptions]);

  // Handle scroll to update activeImageIndex for dots
  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      if (index !== activeImageIndex) {
        setActiveImageIndex(index);
      }
    }
  };

  // Reset activeImageIndex and scroll position when variant changes
  useEffect(() => {
    setActiveImageIndex(0);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'instant' });
    }
  }, [allImages]);

  // Helper to find a preview image for a variant option
  const getVariantPreviewImage = (optionValueId: number) => {
    const variant = product.variants.find(v =>
      v.option_value_ids.includes(optionValueId) && v.images?.length > 0
    );
    return variant?.images[0] || null;
  };

  const currentPrice = activeVariant?.price || product.base_price;
  const originalPrice = product.compare_at_price;
  const discount = product.on_sale ? Math.round(((originalPrice! - currentPrice) / originalPrice!) * 100) : null;

  const handleOptionChange = (optionTypeId: number, optionValueId: number) => {
    setSelectedOptions(prev => {
      const updated = { ...prev, [optionTypeId]: optionValueId };
      const selectionValues = Object.values(updated);

      // Is the new complete combination valid?
      const isCompleteCombinationValid = product.variants.some(v =>
        selectionValues.every(id => v.option_value_ids.includes(id)) &&
        v.option_value_ids.length === selectionValues.length
      );

      if (!isCompleteCombinationValid) {
        // Find the BEST matching variant that contains the newly clicked option
        const visualOts = product.option_types.filter(ot => ot.is_visual);
        const selectedVisualIds = visualOts.map(ot => updated[ot.id]).filter(Boolean) as number[];

        // Priority 1: Must have the new option. 
        // Priority 2: Try to keep as many current visual selections as possible.
        let fallbackVariant = product.variants.find(v => {
          if (!v.option_value_ids.includes(optionValueId)) return false;
          // Must match visual options (except the one we just clicked, if it was a visual option)
          const otherVisualIds = visualOts
            .filter(vot => vot.id !== optionTypeId)
            .map(vot => updated[vot.id])
            .filter(Boolean) as number[];
          return otherVisualIds.every(id => v.option_value_ids.includes(id));
        });

        // If no variant matches the new option AND the other visual options, just match the new option
        if (!fallbackVariant) {
          fallbackVariant = product.variants.find(v => v.option_value_ids.includes(optionValueId));
        }

        if (fallbackVariant) {
          const newSelected: Record<number, number> = {};
          product.option_types.forEach(ot => {
            const matchingVal = ot.values.find(ov => fallbackVariant.option_value_ids.includes(ov.id));
            if (matchingVal) newSelected[ot.id] = matchingVal.id;
          });
          return newSelected;
        }
      }
      return updated;
    });
  };

  const handleAddToCart = async () => {
    if (!activeVariant) return;

    setIsAdding(true);
    try {
      const { ok, data } = await api.cart.addItem(activeVariant.id, quantity);
      if (ok) {
        toast.success(`"${product.name}" added to bag!`, {
          icon: <span>🛍️</span>,
          style: { borderRadius: '1rem', fontWeight: 'bold' }
        });
        // Redirect to cart as requested by user
        setTimeout(() => router.push('/cart'), 1000);
      } else {
        toast.error(data?.error || 'Failed to add item to bag.');
      }
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
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-24 items-start max-w-[1400px] mx-auto px-4 md:px-0 py-0 md:py-8">

      {/* ── LEFT: IMAGE GALLERY (Mobile-centric Slider) ── */}
      <div className="w-full lg:w-[45%] flex flex-col items-center">
        {/* Slider Container with Dots Overlay */}
        <div className="w-full relative group">
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="w-full aspect-[4/5] sm:aspect-square md:aspect-[4/5] rounded-[2.5rem] md:rounded-[4rem] overflow-x-auto overflow-y-hidden scrollbar-none snap-x snap-mandatory flex transition-all duration-700 bg-gray-50 shadow-2xl"
          >
            {allImages.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 snap-center">
                <InnerImageContainer src={img} alt={`${product.name} ${idx}`} />
              </div>
            ))}
          </div>

          {/* Modern Badges - Minimalist */}
          <div className="absolute top-8 left-8 z-10 flex flex-col gap-3">
            {product.on_sale && discount && (
              <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-[#C8382A] text-[10px] font-black uppercase tracking-wider rounded-xl shadow-xl">
                {discount}% OFF
              </span>
            )}
            {product.tags?.some(t => t.toLowerCase().includes('new')) && (
              <span className="px-4 py-2 bg-[#8B7BB4]/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-xl">
                NEW
              </span>
            )}
          </div>

          {/* Large Wishlist Toggle */}
          <button
            onClick={(e) => {
              e.preventDefault();
              const productCard: ProductCardType = {
                id: product.id,
                name: product.name,
                slug: product.slug,
                brand: product.brand,
                base_price: product.base_price,
                compare_at_price: product.compare_at_price,
                discount: product.discount,
                on_sale: product.on_sale,
                cover_image: product.images[0] || null,
                category: product.category?.name || null,
                tags: product.tags
              };
              toggleWishlist(productCard);
            }}
            className={`absolute top-8 right-8 z-20 w-12 h-12 rounded-full backdrop-blur-md shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group/heart border border-white/50 ${isFavorited ? 'bg-[#8B7BB4] text-white' : 'bg-white/90 text-gray-400'
              }`}
          >
            <svg className={`w-5 h-5 transition-colors ${isFavorited ? 'text-white' : 'group-hover/heart:text-[#8B7BB4]'}`} fill={isFavorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Dot Indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2.5 px-4 py-2 bg-black/10 backdrop-blur-sm rounded-full pointer-events-none">
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${activeImageIndex === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: PRODUCT INFO ── */}
      <div className="w-full lg:w-[50%] flex flex-col pt-4 md:pt-0">
        {/* "Atelier" style centered header */}
        <div className="flex items-center justify-between mb-12 py-4 border-y border-gray-50">
          <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
            <img src="https://i.pravatar.cc/100?u=user" alt="user" className="w-full h-full object-cover" />
          </Link>
          <h3 className="text-2xl font-black text-[#1A142E] tracking-tight">{product.brand || 'Atelier'}</h3>
          <Link href="/cart" className="p-2 text-gray-500 hover:text-[#1A142E] transition-all bg-gray-50 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-black bg-[#8B7BB4]/10 text-[#8B7BB4] px-3 py-1 rounded-full uppercase tracking-widest">{product.category?.name}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Handmade Artisan</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-[#1A142E] mb-6 leading-[1.1] tracking-tighter">
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
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-[#1A142E] uppercase tracking-[0.2em]">{ot.name}</h4>
                {selectedOptions[ot.id] && (
                  <span className="text-[10px] font-bold text-[#8B7BB4] tracking-tight">
                    {ot.values.find(v => v.id === selectedOptions[ot.id])?.presentation}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {ot.values.map((ov) => {
                  const isSelected = selectedOptions[ot.id] === ov.id;
                  const isAvailable = availableValueIds.has(ov.id);
                  const previewImg = getVariantPreviewImage(ov.id);
                  const isVisual = ot.is_visual;

                  return isAvailable ? (
                    <button
                      key={ov.id}
                      onClick={() => isAvailable && handleOptionChange(ot.id, ov.id)}
                      disabled={!isAvailable}
                      className={`group relative flex flex-col items-center gap-2 transition-all duration-300 ${isVisual ? 'w-20' : 'min-w-[4rem]'} ${!isAvailable ? 'cursor-not-allowed' : ''}`}
                    >
                      {isVisual && previewImg ? (
                        <div className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 relative ${isSelected ? 'border-[#8B7BB4] scale-105 shadow-xl'
                          : !isAvailable ? 'border-gray-100 opacity-30 grayscale'
                            : 'border-gray-100 opacity-60 hover:opacity-100 grayscale-[0.5] hover:grayscale-0'
                          }`}>
                          <img src={previewImg} alt={ov.presentation} className="w-full h-full object-cover" />
                          {!isAvailable && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-[2px] bg-gray-400/70 rotate-[-45deg] scale-150" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border relative ${isSelected
                          ? 'bg-[#1A142E] text-white border-[#1A142E] shadow-xl scale-105'
                          : !isAvailable
                            ? 'bg-gray-50 text-gray-300 border-gray-100 line-through opacity-50'
                            : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                          }`}>
                          {ov.presentation || ov.value}
                        </div>
                      )}
                      {isVisual && (
                        <span className={`text-[9px] font-bold transition-colors ${isSelected ? 'text-[#1A142E]' : !isAvailable ? 'text-gray-300 line-through' : 'text-gray-400'}`}>
                          {ov.presentation}
                        </span>
                      )}
                      {isSelected && !isVisual && (
                        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#8B7BB4]" />
                      )}
                    </button>
                  ) : null;
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