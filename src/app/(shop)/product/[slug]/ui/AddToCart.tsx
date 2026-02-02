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

    if (!Size) return; // Si no hay talla, paramos

    try {
      // Crear producto
      const cartProduct: CartProduct = {
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: product.price,
        quantity: quantity,
        size: Size,
        image: product.images[0],
      };

      // INTENTAR agregar (si falla, va al catch)
      addProductToCart(cartProduct);

      // ⭐⭐ SOLO SI TODO SALE BIEN ⭐⭐
      setQuantity(1); // Reseteo cantidad
      setSize(undefined); // Reseteo talla
    } catch (error) {
      // ⚠️ SI HAY ERROR: NO RESETEO NADA
      // El usuario mantiene talla y cantidad elegida
      console.log("No se pudo agregar al carrito");
    }

    // Esto siempre se ejecuta (éxito o error)
    setposted(false); // Dejamos de mostrar validación
  };

  return (
    <>
      {posted && !Size && (
        <span className="mt-2 text-red-500">
          Debe de seleccionar una talla!
        </span>
      )}

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
