"use client";

import { useEffect, useState } from "react";
import { useCartStore, useAddressStore } from "@/store";
import { placeOrder, createPreference } from "@/actions";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export const PlaceOrder = () => {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [idempotencyToken, setIdempotencyToken] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "cash">("mercadopago");

  const address = useAddressStore((state) => state.address);
  const shippingMethod = useAddressStore((state) => state.shippingMethod);

  const productsInCart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
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
    if (isPlacingOrder) return;

    // 🛡️ Seguridad cliente: Validar datos mínimos antes de ir al server
    if (productsInCart.length === 0) {
      setErrorMessage("No hay productos en el carrito");
      return;
    }

    // ✅ NUEVO: Validar que todos los productos tengan variantId
    const productsWithoutVariant = productsInCart.filter((p) => !p.variantId);
    if (productsWithoutVariant.length > 0) {
      setErrorMessage("Algunos productos en el carrito están desactualizados. Por favor, elimínalos y agrégalos nuevamente.");
      return;
    }

    if (!address.fullname || !address.phone) {
      setErrorMessage("La dirección de entrega está incompleta");
      return;
    }

    setIsPlacingOrder(true);
    setErrorMessage("");

    // Solo enviamos IDs, cantidades, tallas, variantes y colores (nunca precios)
    const productsToOrder = productsInCart.map((p) => ({
      productId: p.id,
      variantId: p.variantId!, // ✅ Ya validamos que existe arriba
      quantity: p.quantity,
      size: p.size,
      color: p.color || "default",
    }));

    try {
      const resp = await placeOrder(
        productsToOrder,
        address,
        shippingMethod,
        idempotencyToken,
        paymentMethod,
      );

      if (!resp.ok) {
        setIsPlacingOrder(false);
        setErrorMessage(resp.message ?? "Error al crear la orden");

        // Si es un error de duplicado (idempotencia), podrías generar un nuevo token
        // o invitar al usuario a revisar su historial.
        return;
      }

      // 🧹 Limpiar Carrito
      clearCart();

      if (paymentMethod === "mercadopago") {
        // Crear preferencia MP y redirigir directamente
        const preferenceResp = await createPreference(resp.order!.id);
        if (!preferenceResp.ok) {
          setIsPlacingOrder(false);
          setErrorMessage(
            preferenceResp.message ?? "No se pudo generar el link de pago de Mercado Pago"
          );
          return;
        }
        if (!preferenceResp.init_point) {
          setIsPlacingOrder(false);
          setErrorMessage("No se recibió el link de pago de Mercado Pago");
          return;
        }
        window.location.href = preferenceResp.init_point;
      } else {
        // Efectivo/Transferencia: redirigir a la página de la orden
        router.replace(`/orders/${resp.order!.id}`);
      }
    } catch (error) {
      setIsPlacingOrder(false);
      setErrorMessage("Ocurrió un error inesperado. Intente de nuevo.");
      console.error(error);
    }
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

        <div className="flex justify-between text-gray-600">
          <span>Envío</span>
          {shippingMethod === "pickup" ? (
            <span className="font-medium text-green-600">Gratis</span>
          ) : (
            <span className="font-medium text-blue-600">
              A acordar con vendedor
            </span>
          )}
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

      {/* Selector de método de pago */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">
          Método de pago
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("mercadopago")}
            className={clsx(
              "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
              {
                "border-blue-500 bg-blue-50 ring-1 ring-blue-500": paymentMethod === "mercadopago",
                "border-gray-200 hover:border-gray-300": paymentMethod !== "mercadopago",
              }
            )}
          >
            <div
              className={clsx(
                "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                {
                  "border-blue-500": paymentMethod === "mercadopago",
                  "border-gray-300": paymentMethod !== "mercadopago",
                }
              )}
            >
              {paymentMethod === "mercadopago" && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">MercadoPago</p>
              <p className="text-xs text-gray-500">
                Tarjeta de crédito, débito, dinero en cuenta
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("cash")}
            className={clsx(
              "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
              {
                "border-blue-500 bg-blue-50 ring-1 ring-blue-500": paymentMethod === "cash",
                "border-gray-200 hover:border-gray-300": paymentMethod !== "cash",
              }
            )}
          >
            <div
              className={clsx(
                "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                {
                  "border-blue-500": paymentMethod === "cash",
                  "border-gray-300": paymentMethod !== "cash",
                }
              )}
            >
              {paymentMethod === "cash" && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Efectivo / Transferencia
              </p>
              <p className="text-xs text-gray-500">
                Pagás al retirar o mediante transferencia bancaria
              </p>
            </div>
          </button>
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
