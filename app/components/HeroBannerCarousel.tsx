'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Banner } from '../lib/api';

interface HeroBannerCarouselProps {
  banners: Banner[];
}

export default function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const next = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((prev) => (prev + 1) % banners.length);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [banners.length, isTransitioning]);

  const prev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [banners.length, isTransitioning]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (!banners || banners.length === 0) return null;

  const activeBanner = banners[current];

  return (
    <section className="pb-32 relative group">
      <div className="relative h-[600px] md:h-[700px] rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-2xl bg-black">
        
        {/* Background Images */}
        {banners.map((banner, idx) => (
          <div 
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100' : 'opacity-0'}`}
          >
            <img 
              src={banner.image_url} 
              alt={banner.title}
              className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${idx === current ? 'scale-110' : 'scale-100'}`}
            />
            {/* Gradient Overlay based on text alignment */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-gradient-to-r ${
              banner.text_align === 'right' ? 'md:from-transparent md:via-black/10 md:to-black/90' : 
              banner.text_align === 'center' ? 'md:from-black/70 md:via-transparent md:to-black/70' :
              'md:from-black/90 md:via-black/10 md:to-transparent'
            }`} />
          </div>
        ))}

        {/* Content Layer */}
        <div className="absolute inset-0 flex items-center">
           <div className={`container-custom w-full flex ${
             activeBanner.text_align === 'right' ? 'justify-end text-right' : 
             activeBanner.text_align === 'center' ? 'justify-center text-center' : 
             'justify-start text-left'
           }`}>
              <div className={`text-white px-6 md:px-24 lg:px-44 transition-all duration-700 ${
                activeBanner.text_align === 'center' ? 'max-w-5xl' : 'max-w-4xl'
              }`}>
                 
                 {/* Badge/Subtitle Animation */}
                 <div className="overflow-hidden mb-6 md:mb-10">
                    <p className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3rem] md:tracking-[0.5rem] opacity-70 transition-all duration-700 delay-100 transform ${
                      isTransitioning ? (activeBanner.text_align === 'right' ? 'translate-x-full' : '-translate-x-full') : 'translate-x-0'
                    }`}>
                       {activeBanner.subtitle}
                    </p>
                 </div>

                 <div className="overflow-hidden mb-8 md:mb-12">
                    <h2 className={`font-bold leading-[1] tracking-tight transition-all duration-700 transform ${
                      isTransitioning ? 'translate-y-full' : 'translate-y-0'
                    } ${activeBanner.text_align === 'center' ? 'text-5xl md:text-8xl lg:text-9xl' : 'text-4xl md:text-7xl lg:text-8xl'}`}>
                       {activeBanner.title.split(' ').map((word, i) => (
                         <span key={i} className="inline-block mr-4">{word}</span>
                       ))}
                    </h2>
                 </div>

                 <div className="overflow-hidden mb-10 md:mb-14">
                    <p className={`text-sm md:text-xl font-medium opacity-70 leading-relaxed transition-all duration-700 delay-200 transform ${
                      isTransitioning ? (activeBanner.text_align === 'right' ? 'translate-x-full' : '-translate-x-full') : 'translate-x-0'
                    } ${activeBanner.text_align === 'center' ? 'mx-auto max-w-2xl' : activeBanner.text_align === 'right' ? 'ml-auto max-w-xl' : 'max-w-xl'}`}>
                       {activeBanner.description}
                    </p>
                 </div>

                 {/* Button Animation */}
                 <div className={`transition-all duration-700 delay-300 transform ${isTransitioning ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'}`}>
                    <Link href={activeBanner.button_link} className="inline-block px-10 md:px-14 py-4 md:py-6 bg-white text-[#1A142E] rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all hover:bg-gray-100 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0">
                       {activeBanner.button_text}
                    </Link>
                 </div>
              </div>
           </div>
        </div>

        {/* Navigation Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (isTransitioning) return;
                  setIsTransitioning(true);
                  setCurrent(idx);
                  setTimeout(() => setIsTransitioning(false), 800);
                }}
                className={`h-1.5 transition-all duration-500 rounded-full ${
                  idx === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Arrow Navigation (Desktop Only) */}
        {banners.length > 1 && (
          <>
            <button 
              onClick={prev}
              className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={next}
              className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </>
        )}

      </div>
    </section>
  );
}
