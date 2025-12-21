"use client";

import OrderSummary from "./ui/OrderSummary";
import { ProductIncard } from "./ui/ProductIncard";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título principal */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Tu Carrito de Compra
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            producto 3 en tu carrito
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Sección de Items del Carrito */}
          <ProductIncard />

          {/* Resumen del Pedido */}
          <div className="xl:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
