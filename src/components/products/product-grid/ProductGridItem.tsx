"use client";

import Image from "next/image";
import Link from "next/link";

import { Product } from "@/interfaces";
import { useState } from "react";
import { resolveImageSrc, PLACEHOLDER } from "@/lib/image-utils";

interface Props {
  product: Product;
}

import { QuickAddToCart } from "./QuickAddToCart";

export const ProductGridItem = ({ product }: Props) => {
  const [displayImage, setDisplayImage] = useState(product.images[0]);
  const [hasError,     setHasError]     = useState(false);

  const currentSrc = hasError ? PLACEHOLDER : resolveImageSrc(displayImage);

  // Quick Add solo para productos de 1 color (evita error de variante)
  const colorCount = product.colorNames?.length ?? product.colors?.length ?? 0;
  const isSingleColor = colorCount <= 1;

  return (
    <div className="rounded-lg overflow-hidden fade-in relative group flex flex-col">
      <Link href={`/product/${product.slug}`}>
        <Image
          src={currentSrc}
          alt={product.title}
          className="w-full aspect-[4/5] object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
          width={400}
          height={500}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onMouseEnter={() => {
            setHasError(false);
            setDisplayImage(product.images[1] ?? product.images[0]);
          }}
          onMouseLeave={() => {
            setHasError(false);
            setDisplayImage(product.images[0]);
          }}
          onError={() => setHasError(true)}
          priority
        />
      </Link>

      <div className="p-3 sm:p-4 flex flex-col gap-1 flex-1 justify-between">
        <div className="flex flex-col">
          <Link className="font-medium text-sm sm:text-base text-gray-900 hover:text-[#111] transition-colors line-clamp-2" href={`/product/${product.slug}`}>
            {product.title}
          </Link>
          <span className="font-bold text-base sm:text-lg mt-1">${product.price.toLocaleString("es-AR")}</span>
        </div>
        
        {/* Quick Add CTA — solo productos de 1 color */}
        {isSingleColor && (
          <div className="mt-2 sm:mt-3">
            <QuickAddToCart product={product} />
          </div>
        )}
      </div>
    </div>
  );
};
