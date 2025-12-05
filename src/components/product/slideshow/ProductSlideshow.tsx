"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  title: string;
  className?: string;
}

export default function ProductSlideshow({
  images,
  title,
  className = "",
}: Props) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) return null;

  // ⏱️ Cambio automático cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () =>
    setSelectedImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div
      className={`relative w-full max-w-5xl mx-auto ${className} flex flex-col items-center`}
    >
      {/* Imagen principal */}
      <div className="relative w-full h-[800px] rounded-2xl overflow-hidden group shadow-lg">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              selectedImage === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={`/products/${image}`}
              alt={`${title} ${index + 1}`}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 1024px"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Botones de navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Imagen anterior"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              aria-label="Siguiente imagen"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            >
              ›
            </button>
          </>
        )}

        {/* Indicadores inferiores */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  selectedImage === idx
                    ? "bg-white scale-125"
                    : "bg-white/60 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-4 mt-4 overflow-x-auto scrollbar-hide px-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative w-24 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                selectedImage === idx
                  ? "border-gray-900 shadow-lg"
                  : "border-transparent hover:border-gray-400"
              }`}
            >
              <Image
                src={`/products/${img}`}
                alt={`${title} miniatura ${idx + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
