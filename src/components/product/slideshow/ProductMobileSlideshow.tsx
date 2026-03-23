"use client";

import Image from "next/image";

interface Props {
  images: string[];
  title: string;
  className?: string;
}

export default function ProductMobileSlideshow({ images, title, className = "" }: Props) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full shadow-lg rounded-2xl">
        {images.map((image, i) => (
          <div key={i} className="min-w-full snap-center shrink-0">
            <div className="relative w-full aspect-4/5 object-cover sm:aspect-square">
              <Image
                src={`/products/${image}`}
                alt={`${title} - image ${i + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Indicadores estilo iOS/Mobile */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((_, idx) => (
            <div
              key={idx}
              className="w-2 h-2 rounded-full bg-gray-300"
            />
          ))}
        </div>
      )}
    </div>
  );
}
