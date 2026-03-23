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
      className="relative w-full h-full overflow-hidden flex items-center justify-center cursor-crosshair"
      style={{
        // @ts-ignore
        "--url": `url(${src})`,
        "--Zoom-x": "50%",
        "--Zoom-y": "50%",
        "--display": "0",
      }}
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

      {/* zoom lens - Using specific CSS custom properties */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-200"
        style={{
          backgroundImage: "var(--url)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "var(--Zoom-x) var(--Zoom-y)",
          backgroundSize: "300%",
          opacity: "var(--display)",
          // clipPath: "circle(100px at var(--Zoom-x) var(--Zoom-y))", // Alternative for circle lens
        }}
      />
    </div>
  );
};

export default InnerImageContainer;
