"use client";

import { QuantitySelector, SizeSelector } from "@/components";
import type { CartProduct, Product, Size } from "@/interfaces";
import { useCartStore } from "@/store";
import { useState } from "react";

interface Props {
  product: Product;
}

export const AddToCart = ({ product }: Props) => {
  const addProductToCart = useCartStore((state) => state.addProductToCart);

  const [Size, setSize] = useState<Size | undefined>();
  const [quantity, setQuantity] = useState<number>(1);
  const [posted, setposted] = useState(false);

  const addToCart = () => {
    setposted(true);
    if (!Size) return;
    // Lógica para agregar el producto al carrito
    const cartProduct: CartProduct = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity: quantity,
      size: Size,
      image: product.images[0],
    };

    addProductToCart(cartProduct);
    setposted(false);
    setQuantity(1);
    setSize(undefined);
  };

  return (
    <>
      {posted && !Size && (
        <span className="mt-2 text-red-500">
          Debe de seleccionar una talla!
        </span>
      )}

      <p className="text-lg mb-5">${product.price}</p>
      <SizeSelector
        selectedSize={Size}
        availableSizes={product.sizes}
        onSizeChanged={setSize}
      />
      <QuantitySelector quantity={quantity} onQuantityChanged={setQuantity} />
      {/*Button*/}
      <button onClick={addToCart} className="btn-primary my-5">
        Agregar al carrito
      </button>
    </>
  );
};
