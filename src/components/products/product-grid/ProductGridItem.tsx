"use client";

import Image from "next/image";
import Link from "next/link";

import { Product } from "@/interfaces";
import { useState } from "react";

interface Props {
  product: Product;
}

const PLACEHOLDER = "/imgs/placeholder.jpg";

// Resuelve la URL de la imagen: Cloudinary (absoluta) o legacy local (/public/products/)
function resolveImageSrc(image: string | undefined): string {
  if (!image) return PLACEHOLDER;
  if (image.startsWith("http")) return image;
  return `/products/${image}`;
}

export const ProductGridItem = ({ product }: Props) => {
  const [displayImage, setDisplayImage] = useState(product.images[0]);
  const [hasError,     setHasError]     = useState(false);

  const currentSrc = hasError ? PLACEHOLDER : resolveImageSrc(displayImage);

  return (
    <div className="rounded-md overflow-hidden fade-in">
      <Link href={`/product/${product.slug}`}>
        <Image
          src={currentSrc}
          alt={product.title}
          className="w-full aspect-square object-cover rounded"
          width={500}
          height={500}
          onMouseEnter={() => {
            setHasError(false); // reset por si la segunda imagen sí carga
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

      <div className="p-4 flex flex-col">
        <Link className="hover:text-blue-600" href={`/product/${product.slug}`}>
          {product.title}
        </Link>
        <span className="font-bold">${product.price}</span>
      </div>
    </div>
  );
};
