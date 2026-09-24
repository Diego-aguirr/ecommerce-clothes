"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { QuantitySelector, SizeSelector } from "@/components";
import { ColorSelector } from "@/components/product/color-selector/ColorSelector";
import { useProductVariant } from "@/hooks/useProductVariant";
import type { CartProduct } from "@/interfaces";
import type { VariantsByColor } from "@/interfaces/product.interface";
import type { ProductWithVariants } from "@/actions/product/get-product-by-slug";
import { useCartStore } from "@/store";

interface Props {
  product: ProductWithVariants;
  variantsByColor: VariantsByColor[];
  onColorChange?: (color: string) => void;
}

export const AddToCart = ({ product, variantsByColor, onColorChange }: Props) => {
  const addProductToCart = useCartStore((state) => state.addProductToCart);

  const {
    selectedColor,
    selectedSize,
    selectedVariant,
    availableColors,
    availableSizes,
    disabledSizes,
    handleColorChange: handleColorChangeInternal,
    handleSizeChange,
    canAddToCart,
    isOutOfStock,
  } = useProductVariant(variantsByColor);

  const [quantity, setQuantity] = useState(1);
  const [posted, setPosted] = useState(false);
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup al desmontar — evita setState post-unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Obtener imágenes del color seleccionado
  const selectedColorData = variantsByColor.find((vc) => vc.color === selectedColor);
  const colorImages = selectedColorData?.images || product.images;

  // Handler de cambio de color que notifica al parent
  const handleColorChange = (color: string) => {
    handleColorChangeInternal(color);
    onColorChange?.(color);
  };

  const handleAdd = () => {
    setPosted(true);
    
    if (!canAddToCart || !selectedVariant) {
      return;
    }

    const cartProduct: CartProduct = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity,
      size: selectedVariant.size,
      image: colorImages[0] || product.images[0],
      // ✅ NUEVO: Datos de variante
      variantId: selectedVariant.id,
      color: selectedColor,
      sku: selectedVariant.sku,
    };

    addProductToCart(cartProduct);
    setQuantity(1);
    setPosted(false);
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Stock validation */}
      {isOutOfStock && (
        <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg">
          Producto fuera de stock para el color seleccionado.
        </p>
      )}

      {/* Size validation */}
      {posted && !selectedSize && !isOutOfStock && (
        <p className="text-sm text-red-600 font-medium">
          Por favor seleccioná un talle para continuar.
        </p>
      )}

      {/* Color selector */}
      <ColorSelector
        colors={availableColors}
        selectedColor={selectedColor}
        onColorChange={handleColorChange}
      />

      {/* Size selector */}
      <SizeSelector
        selectedSize={selectedSize}
        availableSizes={availableSizes}
        disabledSizes={disabledSizes}
        showStockIndicator={true}
        onSizeChanged={handleSizeChange}
      />

      {/* Stock info */}
      {selectedVariant && (
        <p className="text-sm text-muted-foreground">
          Stock disponible: <span className="font-semibold">{selectedVariant.stock} unidades</span>
          {selectedVariant.sku && (
            <span className="ml-2 text-muted-foreground">| SKU: {selectedVariant.sku}</span>
          )}
        </p>
      )}

      {/* Quantity selector */}
      <QuantitySelector 
        quantity={quantity} 
        onQuantityChanged={setQuantity}
        max={selectedVariant?.stock || 1}
      />

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAddToCart}
          className={`w-full h-12 font-semibold text-[15px] rounded-lg transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            added 
            ? 'bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-600' 
            : !canAddToCart
            ? 'bg-border text-muted-foreground cursor-not-allowed'
            : 'bg-foreground text-background hover:opacity-90 active:scale-[0.98] focus-visible:ring-foreground'
          }`}
        >
          {added 
            ? "✓ Agregado" 
            : !canAddToCart 
            ? selectedSize 
              ? "Sin stock disponible" 
              : "Seleccioná talle y color"
            : "Agregar al carrito"
          }
        </button>

        {added && (
          <Link 
            href="/cart"
            className="w-full h-12 bg-foreground text-background font-bold text-base rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 flex items-center justify-center gap-2"
          >
            Ir a Pagar ➡️
          </Link>
        )}
      </div>

      {/* Shipping info */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="text-lg" aria-hidden="true">
            🚚
          </span>
          <span>Envíos a todo el país</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="text-lg" aria-hidden="true">
            🏪
          </span>
          <span>Retiro en local disponible</span>
        </div>
      </div>
    </div>
  );
};
