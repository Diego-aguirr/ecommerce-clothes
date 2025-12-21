"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store";
import { IoArrowBack, IoCard, IoShieldCheckmark } from "react-icons/io5";
import { currencyFormat } from "@/utils";

const OrderSummary = () => {
  const [loaded, setLoaded] = useState(false);

  // 👇 leemos estado directamente
  const cart = useCartStore((state) => state.cart);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) return <p>Cargando...</p>;

  // 👇 cálculos simples derivados (seguros)
  const itemsInCart = cart.reduce((sum, p) => sum + p.quantity, 0);
  const subTotal = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  // 👇 IVA del 21%
  const taxRate = 0.21;
  const tax = subTotal * taxRate;

  // 👇 Envío: gratis si subTotal > 500.000
  const shippingThreshold = 8000.0;
  const shipping = subTotal > shippingThreshold ? 0 : 8000.0;
  const missingForFreeShipping = Math.max(0, shippingThreshold - subTotal);

  // 👇 Total final
  const total = subTotal + tax + shipping;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Resumen del Pedido
      </h2>

      <div className="space-y-3 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-600">
          <span>
            Subtotal ({itemsInCart} producto{itemsInCart !== 1 ? "s" : ""})
          </span>
          <span className="font-medium">{currencyFormat(subTotal)}</span>
        </div>

        {/* Impuestos (21% IVA) */}
        <div className="flex justify-between text-gray-600">
          <span>Impuestos (21%)</span>
          <span className="font-medium">{currencyFormat(tax)}</span>
        </div>

        {/* Envío - CONDICIONAL */}
        <div className="flex justify-between text-gray-600">
          <span>Envío</span>
          <span
            className={`font-medium ${shipping === 0 ? "text-green-600" : ""}`}
          >
            {shipping === 0 ? "Gratis" : `${currencyFormat(shipping)}`}
          </span>
        </div>

        {/* Mensaje de envío gratis - solo si falta dinero */}
        {missingForFreeShipping > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700 text-center">
              ¡Faltan{" "}
              <span className="font-semibold">
                {currencyFormat(missingForFreeShipping)}
              </span>{" "}
              para envío gratis!
            </p>
          </div>
        )}

        {/* Línea separadora y Total */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{currencyFormat(total)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">IVA incluido</p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="space-y-3">
        <Link
          href="/checkout/address"
          className="w-full bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center"
        >
          <IoCard className="w-5 h-5 mr-2" />
          Finalizar Compra
        </Link>

        <Link
          href="/"
          className="w-full border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
        >
          <IoArrowBack className="w-5 h-5 mr-2" />
          Seguir Comprando
        </Link>
      </div>

      {/* Beneficios */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <IoShieldCheckmark className="w-4 h-4 text-green-500 shrink-0" />
            <span>
              Envío gratis en pedidos +{currencyFormat(shippingThreshold)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IoShieldCheckmark className="w-4 h-4 text-green-500 shrink-0" />
            <span>Devolución gratuita 30 días</span>
          </div>
          <div className="flex items-center gap-2">
            <IoShieldCheckmark className="w-4 h-4 text-green-500 shrink-0" />
            <span>Pago seguro SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
