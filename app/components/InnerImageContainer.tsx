'use client';

import React, { useRef } from "react";

interface InnerImageContainerProps {
  src: string;
  alt?: string;
}

const InnerImageContainer = ({ src, alt = "Product Image" }: InnerImageContainerProps) => {
  const imageZoomRef = useRef<HTMLDivElement>(null);

  const updateZoom = (clientX: number, clientY: number) => {
    if (!imageZoomRef.current) return;
    const rect = imageZoomRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) * 100) / rect.width;
    const y = ((clientY - rect.top) * 100) / rect.height;

    imageZoomRef.current.style.setProperty("--Zoom-x", `${x}%`);
    imageZoomRef.current.style.setProperty("--Zoom-y", `${y}%`);
    imageZoomRef.current.style.setProperty("--display", "1");
  };

  const handleMouseMove = (e: React.MouseEvent) => updateZoom(e.clientX, e.clientY);
  const handleMouseLeave = () => {
    if (imageZoomRef.current) imageZoomRef.current.style.setProperty("--display", "0");
  };

  const handleTouch = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    updateZoom(touch.clientX, touch.clientY);
  };
  const endTouch = () => {
    if (imageZoomRef.current) imageZoomRef.current.style.setProperty("--display", "0");
  };

  return (
    <div
      ref={imageZoomRef}
      style={{
        // @ts-ignore
        "--url": `url(${src})`,
        "--Zoom-x": "50%",
        "--Zoom-y": "50%",
        "--display": "0",
        "--Lens-Radius": "100px", // Default for mobile
      }}
      className="relative w-full h-full overflow-hidden flex items-center justify-center cursor-crosshair md:[--Lens-Radius:180px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={endTouch}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />

      {/* zoom lens - Using an img tag with transform-origin for perfect magnification */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out overflow-hidden"
        style={{
          opacity: "var(--display)",
          // Responsive radius: larger on desktop (md: 180px), smaller on mobile (100px)
          clipPath: "circle(var(--Lens-Radius, 100px) at var(--Zoom-x) var(--Zoom-y))",
          WebkitClipPath: "circle(var(--Lens-Radius, 100px) at var(--Zoom-x) var(--Zoom-y))",
        }}
      >
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{
            transform: "scale(2.5)", // Fixed 2.5x magnification of the visible area
            transformOrigin: "var(--Zoom-x) var(--Zoom-y)",
          }}
        />
      </div>

      {/* premium lens ring decoration */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out"
        style={{
          opacity: "var(--display)",
          background: "transparent",
        }}
      >
        <div 
          className="absolute border-2 border-white/40 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2),inset_0_0_15px_rgba(255,255,255,0.3)] backdrop-blur-[1px]"
          style={{
            width: "calc(var(--Lens-Radius, 100px) * 2)",
            height: "calc(var(--Lens-Radius, 100px) * 2)",
            left: "var(--Zoom-x)",
            top: "var(--Zoom-y)",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    </div>
  );
};

export default InnerImageContainer;
