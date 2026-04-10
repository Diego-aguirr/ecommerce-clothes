"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  title: string;
  className?: string;
}

const PLACEHOLDER = "/imgs/placeholder.jpg";

function resolveImageSrc(image: string | undefined): string {
  if (!image) return PLACEHOLDER;
  if (image.startsWith("http")) return image;
  return `/products/${image}`;
}

// Función auxiliar para renderizar con manejo de error local
function FallbackImage({
  image,
  alt,
  priority = false,
  sizes,
  className
}: {
  image: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className: string;
}) {
  const [hasError, setHasError] = useState(false);
  const src = hasError ? PLACEHOLDER : resolveImageSrc(image);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setHasError(true)}
    />
  );
}

export default function ProductSlideshow({
  images,
  title,
  className = "",
}: Props) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Garantizar que haya al menos 1 elemento para que renderice el placeholder si la DB lo manda vacío
  const safeImages = images.length === 0 ? [""] : images;

  // ⏱️ Cambio automático cada 2 segundos
  useEffect(() => {
    if (safeImages.length <= 1) return;

    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % safeImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [safeImages.length]);

  const nextImage = () =>
    setSelectedImage((prev) => (prev + 1) % safeImages.length);
  const prevImage = () =>
    setSelectedImage((prev) => (prev - 1 + safeImages.length) % safeImages.length);

  return (
    <div
      className={`relative w-full max-w-5xl mx-auto ${className} flex flex-col items-center`}
    >
      {/* Imagen principal */}
      <div className="relative w-full aspect-square md:aspect-auto md:h-[600px] lg:h-[800px] rounded-2xl overflow-hidden group shadow-lg">
        {safeImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              selectedImage === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <FallbackImage
              image={image}
              alt={`${title} ${index + 1}`}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 1024px"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Botones de navegación */}
        {safeImages.length > 1 && (
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
        {safeImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            {safeImages.map((_, idx) => (
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
      {safeImages.length > 1 && (
        <div className="flex gap-4 mt-4 overflow-x-auto scrollbar-hide px-2">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative w-24 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                selectedImage === idx
                  ? "border-gray-900 shadow-lg"
                  : "border-transparent hover:border-gray-400"
              }`}
            >
              <FallbackImage
                image={img}
                alt={`${title} miniatura ${idx + 1}`}
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
