"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveImageSrc, PLACEHOLDER } from "@/lib/image-utils";

interface Props {
  images: string[];
  title: string;
  className?: string;
}

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

export const ProductMobileSlideshow = ({
  images,
  title,
  className = "",
}: Props) => {
  const safeImages = images.length === 0 ? [""] : images;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full shadow-lg rounded-2xl">
        {safeImages.map((image, i) => (
          <div key={i} className="min-w-full snap-center shrink-0">
            <div className="relative w-full aspect-[4/5] object-cover sm:aspect-square">
              <SlideImage image={image} title={title} i={i} />
            </div>
          </div>
        ))}
      </div>

      {safeImages.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {safeImages.map((_, idx) => (
            <div key={idx} className="w-2 h-2 rounded-full bg-border" />
          ))}
        </div>
      )}
    </div>
  );
};
