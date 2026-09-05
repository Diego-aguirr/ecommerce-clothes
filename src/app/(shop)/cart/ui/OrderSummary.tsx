"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store";
import { IoArrowBack, IoCard, IoShieldCheckmark } from "react-icons/io5";
import { currencyFormat } from "@/utils";

const OrderSummary = () => {
  const [loaded, setLoaded] = useState(true);

  // 👇 leemos estado directamente
  const cart = useCartStore((state) => state.cart);

  if (!loaded) return <p>Cargando...</p>;

  // 👇 cálculos simples derivados (seguros)
  const itemsInCart = cart.reduce((sum, p) => sum + p.quantity, 0);
  const subTotal = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  // 👇 IVA del 21%
  const IVA_RATE = 0.21;
  const total = subTotal; // subTotal ya incluye IVA
  const ivaIncluido = total - total / (1 + IVA_RATE); // IVA extraído para mostrar

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

        {/* Envío */}
        <div className="flex justify-between text-gray-600">
          <span>Envío</span>
          <span className="font-medium text-gray-900">
            Retiro gratis / Envío a acordar
          </span>
        </div>

        {/* Línea separadora y Total */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{currencyFormat(total)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            IVA incluido: {currencyFormat(ivaIncluido)}
          </p>
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
