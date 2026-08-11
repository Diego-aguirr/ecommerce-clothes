"use client";

import { useState } from "react";
import type { NextFont } from "next/dist/compiled/@next/font";
import { StockLabel } from "@/components";
import ProductImageGallery from "@/components/product/slideshow/ProductImageGallery";
import ProductMobileSlideshow from "@/components/product/slideshow/ProductMobileSlideshow";
import { AddToCart } from "./AddToCart";
import { ShareButtons } from "@/components/product/share-buttons/ShareButtons";
import type { ProductWithVariants } from "@/actions/product/get-product-by-slug";

interface Props {
  product: ProductWithVariants;
  titleFont: NextFont;
}

export const ProductPageClient = ({ product, titleFont }: Props) => {
  // Estado para el color seleccionado (afecta las imágenes)
  const [selectedColor, setSelectedColor] = useState<string>(
    product.variantsByColor[0]?.color || "default",
  );

  // Obtener imágenes del color seleccionado
  const selectedColorData = product.variantsByColor.find(
    (vc) => vc.color === selectedColor,
  );
  const colorImages =
    selectedColorData && selectedColorData.images.length > 0
      ? selectedColorData.images
      : product.images;

  return (
    <>
      {/* ── DESKTOP: Gallery adaptativo + Info ── */}
      <div className="hidden md:grid md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px] gap-6 lg:gap-10">
        {/* Col 1 — Gallery adaptativo (1, 2, o 3+ imágenes) */}
        <ProductImageGallery
          images={colorImages}
          title={product.title}
        />

        {/* Col 2 — Info y compra */}
        <div className="flex flex-col gap-6 py-2">
          <div>
            <StockLabel slug={product.slug} />
            <h1
              className={`${titleFont.className} antialiased font-bold text-2xl lg:text-3xl text-gray-900 leading-tight mt-2`}
            >
              {product.title}
            </h1>
            <p className="text-4xl font-light text-gray-900 mt-4 tracking-tight">
              ${product.price.toLocaleString("es-AR")}
            </p>
          </div>

          <AddToCart
            product={product}
            variantsByColor={product.variantsByColor}
            onColorChange={setSelectedColor}
          />

          {/* Descripción */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Descripción
            </h3>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              {product.description}
            </p>
          </div>

          {/* Share */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Compartir
            </h3>
            <ShareButtons
              title={product.title}
              slug={product.slug}
              imageUrl={colorImages[0]}
            />
          </div>
        </div>
      </div>

      {/* ── MOBILE: stack ── */}
      <div className="md:hidden flex flex-col gap-6">
        <ProductMobileSlideshow title={product.title} images={colorImages} />

        <div className="flex flex-col gap-6 px-1">
          <div>
            <StockLabel slug={product.slug} />
            <h1
              className={`${titleFont.className} antialiased font-bold text-2xl text-gray-900 leading-tight mt-2`}
            >
              {product.title}
            </h1>
            <p className="text-3xl font-light text-gray-900 mt-3">
              ${product.price.toLocaleString("es-AR")}
            </p>
          </div>

          <AddToCart
            product={product}
            variantsByColor={product.variantsByColor}
            onColorChange={setSelectedColor}
          />

          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Descripción
            </h3>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              {product.description}
            </p>
          </div>

          {/* Share */}
          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Compartir
            </h3>
            <ShareButtons
              title={product.title}
              slug={product.slug}
              imageUrl={colorImages[0]}
            />
          </div>
        </div>
      </div>
    </>
  );
};
