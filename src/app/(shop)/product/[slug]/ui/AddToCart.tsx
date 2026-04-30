"use client";

import { useState } from "react";
import Link from "next/link";
import { QuantitySelector, SizeSelector } from "@/components";
import type { CartProduct, Product, Size } from "@/interfaces";
import { useCartStore } from "@/store";

interface Props {
  product: Product;
}

export const AddToCart = ({ product }: Props) => {
  const addProductToCart = useCartStore((state) => state.addProductToCart);

  const [size, setSize] = useState<Size | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [posted, setPosted] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setPosted(true);
    if (!size) return;

    const cartProduct: CartProduct = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity,
      size,
      image: product.images[0],
    };

    addProductToCart(cartProduct);
    setQuantity(1);
    setSize(undefined);
    setPosted(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Size validation */}
      {posted && !size && (
        <p className="text-sm text-red-600 font-medium">
          Por favor seleccioná un talle para continuar.
        </p>
      )}

      {/* Size selector */}
      <SizeSelector
        selectedSize={size}
        availableSizes={product.sizes}
        onSizeChanged={setSize}
      />

      {/* Quantity selector */}
      <QuantitySelector quantity={quantity} onQuantityChanged={setQuantity} />

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className={`w-full h-14 font-semibold text-base rounded-lg transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            added 
            ? 'bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-600' 
            : 'bg-gray-900 text-white hover:bg-black active:scale-[0.98] focus-visible:ring-gray-900'
          }`}
        >
          {added ? "✓ Agregado" : "Agregar al carrito"}
        </button>

        {added && (
          <Link 
            href="/cart"
            className="w-full h-14 bg-indigo-600 text-white font-bold text-base rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
          >
            Ir a Pagar ➡️
          </Link>
        )}
      </div>

      {/* Shipping info */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="text-lg" aria-hidden>
            🚚
          </span>
          <span>Envíos a todo el país</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="text-lg" aria-hidden>
            🏪
          </span>
          <span>Retiro en local disponible</span>
        </div>
      </div>
    </div>
  );
};
