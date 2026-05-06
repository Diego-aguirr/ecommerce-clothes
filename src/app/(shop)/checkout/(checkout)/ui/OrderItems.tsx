"use client";

import Image from "next/image";
import { useCartStore } from "@/store";
import { useEffect, useState } from "react";

export const OrderItems = () => {
  const [loaded, setLoaded] = useState(false);
  const productsInCart = useCartStore((state) => state.cart);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <p className="animate-pulse">Cargando carrito...</p>;
  }

  if (productsInCart.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
        <a
          href="/"
          className="text-brand-primary font-semibold hover:text-brand-accent transition-colors"
        >
          Agregar productos
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Tu Pedido</h2>
      <div className="space-y-4">
        {productsInCart.map((item) => (
          <div
            key={`${item.slug}-${item.size}`}
            className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
          >
            <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
              <Image
                src={item.image?.startsWith('http') ? item.image : `/products/${item.image}`}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {item.title}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-xs text-gray-500">
                  Talla: {item.size}
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">
                  Cant: {item.quantity}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 mt-1">
                ${(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
