"use client";

import { useState } from "react";
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

// Subcomponente para manejar el error de imagen individualmente
function SlideImage({
  image,
  title,
  i,
}: {
  image: string;
  title: string;
  i: number;
}) {
  const [hasError, setHasError] = useState(false);
  const src = hasError ? PLACEHOLDER : resolveImageSrc(image);

  return (
    <Image
      src={src}
      alt={`${title} - image ${i + 1}`}
      fill
      className="object-cover"
      sizes="100vw"
      priority={i === 0}
      onError={() => setHasError(true)}
    />
  );
}

export default function ProductMobileSlideshow({
  images,
  title,
  className = "",
}: Props) {
  // Garantizar que si llega un array vacío de la DB, se renderice al menos 1 placeholder
  const safeImages = images.length === 0 ? [""] : images;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full shadow-lg rounded-2xl">
        {safeImages.map((image, i) => (
          <div key={i} className="min-w-full snap-center shrink-0">
            <div className="relative w-full aspect-4/5 object-cover sm:aspect-square">
              <SlideImage image={image} title={title} i={i} />
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores estilo iOS/Mobile */}
      {safeImages.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {safeImages.map((_, idx) => (
            <div key={idx} className="w-2 h-2 rounded-full bg-gray-300" />
          ))}
        </div>
      )}
    </div>
  );
}
