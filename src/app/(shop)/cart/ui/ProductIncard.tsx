"use client";
import { QuantitySelector } from "@/components";
import { useCartStore } from "@/store/cart/cart-store";
import Image from "next/image";
import Link from "next/link";

export const ProductIncard = () => {
  const removeProduct = useCartStore((state) => state.removeProduct);
  const updateProductQuantity = useCartStore(
    (state) => state.updateProductQuantity,
  );

  const productIncart = useCartStore((state) => state.cart);

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6">
      {productIncart.map((product) => (
        <div
          key={product.variantId ?? `${product.slug}-${product.size}`}
          className="bg-background rounded-lg shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Imagen del producto */}
            <div className="shrink-0">
              <div className="relative w-20 h-24 sm:w-24 sm:h-32 bg-muted rounded-lg overflow-hidden">
                <Image
                  src={product.image?.startsWith('http') ? product.image : `/products/${product.image}`}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </div>
            </div>

            {/* Información del producto */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <div className="flex-1">
                  <Link
                    className="hover:underline cursor-pointer"
                    href={`/product/${product.slug}`}
                  >
                    <h3 className="font-semibold text-foreground text-base sm:text-lg">
                      {product.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
                      Talle: {product.size}
                    </span>
                    {product.color && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
                        {product.color.replace(/_/g, " ")}
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
                      ${product.price}
                    </span>
                  </div>
                </div>

                {/* Precio desktop */}
                <div className="hidden sm:block text-right">
                  <p className="font-semibold text-lg text-foreground">
                    ${(product.price * product.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${product.price.toFixed(2)} c/u
                  </p>
                </div>
              </div>

              {/* Controles y acciones */}
              <div className="flex items-center justify-between mt-4">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <QuantitySelector
                    quantity={product.quantity}
                    onQuantityChanged={(quantity) =>
                      updateProductQuantity(product, quantity)
                    }
                  />

                  {/* Botón eliminar */}
                  <button
                    onClick={() => removeProduct(product)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                  >
                    <span>Eliminar</span>
                  </button>
                </div>

                {/* Precio móvil */}
                <div className="sm:hidden text-right">
                  <p className="font-semibold text-foreground"></p>
                  <p className="text-xs text-muted-foreground"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
