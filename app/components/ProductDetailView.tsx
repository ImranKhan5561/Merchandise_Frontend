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

const getSpecIcon = (name: string) => {
  const norm = name.toLowerCase();

  // ----- ELECTRONICS -----
  if (norm.includes('display') || norm.includes('screen') || norm.includes('resolution') || norm.includes('panel')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
  if (norm.includes('processor') || norm.includes('chip') || norm.includes('ram') || norm.includes('core')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
  if (norm.includes('battery') || norm.includes('power') || norm.includes('charging') || norm.includes('energy')) return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 20H8V6h8v14zm-2-16h-4V2h4v2z" /></svg>;
  if (norm.includes('camera') || norm.includes('lens') || norm.includes('optics') || norm.includes('video')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  if (norm.includes('storage') || norm.includes('capacity') || norm.includes('memory') || norm.includes('hdd') || norm.includes('ssd')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
  if (norm.includes('connectivity') || norm.includes('network') || norm.includes('wifi') || norm.includes('bluetooth') || norm.includes('cellular') || norm.includes('5g')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>;

  // ----- FASHION & LIFESTYLE -----
  if (norm.includes('fabric') || norm.includes('material') || norm.includes('blend') || norm.includes('leather')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
  if (norm.includes('fit') || norm.includes('cut') || norm.includes('style') || norm.includes('silhouette') || norm.includes('gender')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  if (norm.includes('care') || norm.includes('wash') || norm.includes('cleaning')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;

  // ----- DIMENSIONS & MISC -----
  if (norm.includes('size') || norm.includes('dimension') || norm.includes('measurement') || norm.includes('height') || norm.includes('width') || norm.includes('length')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>;
  if (norm.includes('weight') || norm.includes('mass') || norm.includes('density') || norm.includes('heavy')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;
  if (norm.includes('color') || norm.includes('finish') || norm.includes('dye') || norm.includes('paint')) return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;

  // ----- GENERIC FALLBACK (Information icon instead of tech bolt) -----
  return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const sliderRef = useRef<HTMLDivElement>(null);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorited = isInWishlist(product.id);
  const [isAdding, setIsAdding] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
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

  const allImages = useMemo(() => {
    const hasVariantsWithOptions = product.variants.some(v => v.option_value_ids.length > 0);
    if (!hasVariantsWithOptions) return product.images || [];

    const variantImages = activeVariant?.images || [];
    if (variantImages.length > 0) return variantImages;

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

  const availableValueIds = useMemo(() => {
    const available = new Set<number>();
    const visualOts = product.option_types.filter(ot => ot.is_visual);

    product.option_types.forEach(ot => {
      ot.values.forEach(ov => {
        const otherVisualIds = visualOts
          .filter(vot => vot.id !== ot.id)
          .map(vot => selectedOptions[vot.id])
          .filter(Boolean) as number[];

        const hasVariant = product.variants.some(v => {
          if (!v.option_value_ids.includes(ov.id)) return false;
          return otherVisualIds.every(id => v.option_value_ids.includes(id));
        });

        if (hasVariant) available.add(ov.id);
      });
    });
    return available;
  }, [product.variants, product.option_types, selectedOptions]);

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      if (index !== activeImageIndex) setActiveImageIndex(index);
    }
  };

  useEffect(() => {
    setActiveImageIndex(0);
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'instant' });
    }
  }, [allImages]);

  const getVariantPreviewImage = (optionValueId: number) => {
    const variant = product.variants.find(v =>
      v.option_value_ids.includes(optionValueId) && v.images?.length > 0
    );
    return variant?.images[0] || null;
  };

  const currentPrice = activeVariant?.price || product.base_price;
  const originalPrice = product.compare_at_price;

  const handleOptionChange = (optionTypeId: number, optionValueId: number) => {
    setSelectedOptions(prev => {
      const updated = { ...prev, [optionTypeId]: optionValueId };
      const selectionValues = Object.values(updated);

      const isCompleteCombinationValid = product.variants.some(v =>
        selectionValues.every(id => v.option_value_ids.includes(id)) &&
        v.option_value_ids.length === selectionValues.length
      );

      if (!isCompleteCombinationValid) {
        const visualOts = product.option_types.filter(ot => ot.is_visual);
        let fallbackVariant = product.variants.find(v => {
          if (!v.option_value_ids.includes(optionValueId)) return false;
          const otherVisualIds = visualOts
            .filter(vot => vot.id !== optionTypeId)
            .map(vot => updated[vot.id])
            .filter(Boolean) as number[];
          return otherVisualIds.every(id => v.option_value_ids.includes(id));
        });

        if (!fallbackVariant) {
          fallbackVariant = product.variants.find(v => v.option_value_ids.includes(optionValueId));
        }

        if (fallbackVariant) {
          const newSelected: Record<number, number> = {};
          product.option_types.forEach(ot => {
            const matchingVal = ot.values.find(ov => fallbackVariant!.option_value_ids.includes(ov.id));
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
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-8 bg-[#FDFBFF] md:bg-transparent min-h-screen">

      {/* ── LEFT: IMAGE GALLERY ── */}
      <div className="w-full lg:w-[45%] flex flex-col items-center">
        <div className="w-full relative group">
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="w-full aspect-[3/4] rounded-[2.5rem] md:rounded-[3rem] overflow-x-auto overflow-y-hidden scrollbar-none snap-x snap-mandatory flex bg-white shadow-xl border border-[#F5F3FB]"
          >
            {allImages.length > 0 ? (
              allImages.map((img, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-center">
                  <InnerImageContainer src={img} alt={`${product.name} ${idx}`} />
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                No Image Available
              </div>
            )}
          </div>

          <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
            {product.tags?.some(t => t.toLowerCase().includes('new')) && (
              <span className="px-4 py-1.5 bg-[#1F2937]/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-md">
                NEW ARRIVAL
              </span>
            )}
          </div>
        </div>

        {/* THUMBNAILS (Visual Variants like in the mockup) */}
        {allImages.length > 1 && (
          <div className="flex gap-4 w-full justify-center overflow-x-auto pb-4 pt-6 px-1 scrollbar-hide">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveImageIndex(idx);
                  if (sliderRef.current) {
                    sliderRef.current.scrollTo({ left: idx * sliderRef.current.clientWidth, behavior: 'smooth' });
                  }
                }}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex-shrink-0 overflow-hidden border-[3px] transition-all duration-300 ${activeImageIndex === idx ? 'border-[#6D5E99] scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'}`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: PRODUCT INFO (Reordered) ── */}
      <div className="w-full lg:w-[50%] flex flex-col pt-2 md:pt-4">

        {/* Title & Price */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1A142E] tracking-tight leading-none mb-1">
              {product.name}
            </h1>
            {/* Subtitle / Selected Visual Variant (Mockup shows "Celestial Violet" right under "Aura Pro Max") */}
            {product.option_types.filter(ot => ot.is_visual).map(ot => {
              const selectedVal = ot.values.find(v => v.id === selectedOptions[ot.id]);
              return selectedVal ? <p key={ot.id} className="text-xl md:text-2xl italic text-[#6D5E99] font-medium leading-none">{selectedVal.presentation}</p> : null;
            })}
          </div>

          <div className="text-right">
            {originalPrice && originalPrice > currentPrice && (
              <span className="text-sm text-gray-400 line-through font-medium block">${originalPrice.toFixed(0)}</span>
            )}
            <span className="text-2xl md:text-3xl font-black text-[#6D5E99]">${currentPrice.toFixed(0)}</span>
          </div>
        </div>

        {/* ── VARIANTS / OPTIONS ── */}
        <div className="space-y-6 mb-10">
          {product.option_types.map(ot => {
            const isVisual = ot.is_visual;
            return (
              <div key={ot.id}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{isVisual ? 'FINISH SELECTION' : ot.name}</h4>
                  {!isVisual && (
                    <span className="text-[9px] font-bold text-[#6D5E99] tracking-tight underline cursor-pointer">
                      Guide
                    </span>
                  )}
                </div>

                <div className={`flex flex-wrap gap-3 ${isVisual ? 'justify-start' : 'justify-start md:justify-between'}`}>
                  {ot.values.map((ov) => {
                    const isSelected = selectedOptions[ot.id] === ov.id;
                    const isAvailable = availableValueIds.has(ov.id);
                    const previewImg = getVariantPreviewImage(ov.id);

                    if (isVisual) {
                      return (
                        <button
                          key={ov.id}
                          onClick={() => isAvailable && handleOptionChange(ot.id, ov.id)}
                          disabled={!isAvailable}
                          className={`w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-[3px] transition-all duration-300 ${isSelected ? 'border-[#6D5E99] scale-110 shadow-lg' : !isAvailable ? 'border-gray-100 opacity-30 cursor-not-allowed' : 'border-transparent ring-1 ring-gray-200 hover:ring-[#6D5E99] hover:scale-105'}`}
                          title={ov.presentation}
                        >
                          {previewImg ? (
                            <img src={previewImg} alt={ov.presentation} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center text-[8px] font-bold text-gray-500 uppercase">{ov.presentation.slice(0, 3)}</div>
                          )}
                        </button>
                      );
                    } else {
                      return (
                        <button
                          key={ov.id}
                          onClick={() => isAvailable && handleOptionChange(ot.id, ov.id)}
                          disabled={!isAvailable}
                          className={`flex-1 min-w-[5rem] py-3.5 rounded-[2rem] text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${isSelected
                            ? 'bg-[#6D5E99] text-white border-[#6D5E99] shadow-md scale-[1.02]'
                            : !isAvailable
                              ? 'bg-gray-50 text-gray-300 border-gray-100 line-through opacity-50 cursor-not-allowed'
                              : 'bg-[#F9F8FD] text-gray-600 border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm'
                            }`}
                        >
                          {ov.presentation || ov.value}
                        </button>
                      );
                    }
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── TECHNICAL PROWESS (Specs Grid) ── */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="mb-10">
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Technical Prowess</h4>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {product.specifications.slice(0, 4).map((spec, idx) => (
                <div key={idx} className="bg-[#FAF9FC] rounded-[2.5rem] p-5 flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
                  <span className="text-[#6D5E99] mb-2">
                    {getSpecIcon(spec.name)}
                  </span>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{spec.name}</span>
                  <span className="text-xs font-bold text-[#1A142E] leading-tight">{spec.value}</span>
                </div>
              ))}
            </div>
            {product.specifications.length > 4 && (
              <div className="mt-3 md:mt-4 grid grid-cols-2 gap-3 md:gap-4">
                {product.specifications.slice(4).map((spec, idx) => (
                  <div key={idx + 4} className="bg-[#FAF9FC] rounded-[2.5rem] p-5 flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{spec.name}</span>
                    <span className="text-xs font-bold text-[#1A142E] leading-tight">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── THE PRODUCT STORY ── */}
        <div className="mb-12 bg-[#F9F8FD] rounded-[3rem] p-8 md:p-10 relative overflow-hidden">
          {/* Subtle star shape decoration in corner similar to mockup */}
          <div className="absolute -bottom-6 -right-6 text-white opacity-40">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
            </svg>
          </div>
          <h4 className="text-[14px] font-black text-[#1A142E] mb-3">The Product Story</h4>
          <p className="text-[13px] text-gray-500 leading-relaxed font-medium relative z-10">
            {product.description || "Crafted for the dreamers and the doers. This product isn't just a device—it's a symphony of light and glass. We've pushed the boundaries of aesthetic engineering to create a finish that shifts with your movement."}
          </p>
        </div>

        {/* ── CUSTOMER STORIES ── */}
        <div className="mb-32 md:mb-12">
          <div className="flex items-end justify-between mb-6">
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
              Voice of the Atelier<br />
              <span className="text-xl font-bold text-[#1A142E] normal-case tracking-normal">Customer Stories</span>
            </h4>
            <div className="text-sm font-black text-[#6D5E99] flex items-center gap-1">
              4.9 <span className="text-[10px]">★</span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-[#F5F3FB] mb-4">
            <div className="text-[#6D5E99] text-xs mb-3 flex gap-0.5">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <p className="text-[13px] text-gray-600 italic font-medium mb-4">
              "The design is unlike anything I've ever seen. In direct sunlight, it shines elegantly. Truly a premium piece of tech."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E5E0F1] flex items-center justify-center text-[#6D5E99] text-[9px] font-black uppercase">EV</div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Elena V. — Verified Collector</span>
            </div>
          </div>

          <button className="w-full py-4 rounded-full border border-[#E5E0F1] text-[11px] font-black text-[#6D5E99] bg-[#FDFBFF] hover:bg-[#F9F8FD] transition-colors uppercase tracking-widest">
            View All 128 Reviews
          </button>
        </div>

      </div>

      {/* ── BOTTOM STICKY ACTIONS ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-50 p-4 md:p-6 z-40 flex items-center gap-4 justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.03)] lg:bg-transparent lg:border-none lg:shadow-none lg:bottom-auto lg:top-8 lg:left-auto lg:right-12 lg:w-auto lg:flex-col lg:backdrop-blur-none">
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
          className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-colors group ${isFavorited ? 'bg-[#E5E0F1] text-[#6D5E99]' : 'bg-[#F5F3FB] text-gray-400 hover:text-red-500'}`}
        >
          <svg className={`w-6 h-6 transition-transform ${isFavorited ? 'scale-110' : 'group-hover:scale-110'}`} fill={isFavorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <button
          onClick={handleAddToCart}
          disabled={isAdding || activeVariant?.stock === 0}
          className="flex-1 lg:flex-none lg:px-12 h-14 bg-[#6D5E99] text-white rounded-full font-bold text-[13px] transition-all hover:bg-[#594C82] hover:shadow-xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 shadow-lg flex items-center justify-center gap-2"
        >
          {isAdding ? (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3z" /></svg>
              Add to Bag
            </>
          )}
        </button>
      </div>

    </div>
  );
}
