"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store";
import { useState } from "react";

export const OrderItems = () => {
  const [loaded, setLoaded] = useState(true);
  const productsInCart = useCartStore((state) => state.cart);

  if (!loaded) {
    return <p className="animate-pulse">Cargando carrito...</p>;
  }

  if (productsInCart.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
        <Link
          href="/"
          className="text-foreground font-semibold hover:text-muted-foreground transition-colors"
        >
          Agregar productos
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Tu Pedido</h2>
      <div className="space-y-4">
        {productsInCart.map((item) => (
          <div
            key={`${item.slug}-${item.size}`}
            className="flex items-center gap-4 pb-4 border-b border-border last:border-b-0 last:pb-0"
          >
            <div className="w-16 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
              <Image
                src={item.image?.startsWith('http') ? item.image : `/products/${item.image}`}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {item.title}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-xs text-muted-foreground">
                  Talle: {item.size}
                </span>
                {item.color && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.color.replace(/_/g, " ")}
                    </span>
                  </>
                )}
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  Cant: {item.quantity}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground mt-1">
                ${(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
