"use client";

import { useEffect, useState } from "react";
import { useCartStore, useAddressStore } from "@/store";
import { placeOrder } from "@/actions";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export const PlaceOrder = () => {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [idempotencyToken, setIdempotencyToken] = useState("");

  const address = useAddressStore((state) => state.address);

  const productsInCart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.removeProduct);
  const getSummaryInformation = useCartStore(
    (state) =>
      state.getSummaryInformation ||
      (() => ({ subTotal: 0, tax: 0, total: 0, itemsInCart: 0 })),
  );

  const { subTotal, tax, total, itemsInCart } = getSummaryInformation();

  useEffect(() => {
    setLoaded(true);
    // Generar un token de idempotencia único para esta sesión de confirmación
    setIdempotencyToken(crypto.randomUUID());
  }, []);

  if (!loaded) {
    return <p className="animate-pulse">Cargando...</p>;
  }

  const onPlaceOrder = async () => {
    setIsPlacingOrder(true);
    setErrorMessage("");

    // Solo enviamos IDs, cantidades y tallas (nunca precios)
    const productsToOrder = productsInCart.map((p) => ({
      productId: p.id,
      quantity: p.quantity,
      size: p.size,
    }));

    const resp = await placeOrder(productsToOrder, address, idempotencyToken);

    if (!resp.ok) {
      setIsPlacingOrder(false);
      setErrorMessage(resp.message ?? "Error al crear la orden");
      return;
    }


    // Redirigir a la página de la orden creada
    router.replace(`/orders/${resp.order!.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen Final</h2>

      {/* Detalles de precio */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemsInCart} productos)</span>
          <span className="font-medium">${subTotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>IVA</span>
          <span className="font-medium">${tax.toLocaleString()}</span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            IVA e impuestos incluidos
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onPlaceOrder}
          disabled={isPlacingOrder || productsInCart.length === 0}
          className={clsx(
            "w-full bg-black text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center text-lg shadow-sm hover:shadow-md",
            {
              "opacity-50 cursor-not-allowed":
                isPlacingOrder || productsInCart.length === 0,
              "hover:bg-gray-900": !isPlacingOrder && productsInCart.length > 0,
            },
          )}
        >
          {isPlacingOrder ? "Procesando..." : "Finalizar Compra"}
        </button>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center mt-2">
            {errorMessage}
          </p>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <svg
              className="w-4 h-4 text-green-500 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Pago 100% seguro con encriptación SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
