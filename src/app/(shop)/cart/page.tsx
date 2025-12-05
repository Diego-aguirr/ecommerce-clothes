import { QuantitySelector } from "@/components";
import { initialData } from "@/seed/seed";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  IoTrashOutline,
  IoArrowBack,
  IoCard,
  IoShieldCheckmark,
} from "react-icons/io5";

// Tomamos productos reales del seed data para el carrito
const cartItems = [
  {
    id: "1",
    name: initialData.products[0].title,
    price: initialData.products[0].price,
    quantity: 1,
    size: "M",
    color: "Negro",
    image: initialData.products[0].images[0],
  },
  {
    id: "2",
    name: initialData.products[1].title,
    price: initialData.products[1].price,
    quantity: 2,
    size: "L",
    color: "Azul Marino",
    image: initialData.products[1].images[0],
  },
  {
    id: "3",
    name: initialData.products[4].title,
    price: initialData.products[4].price,
    quantity: 1,
    size: "S",
    color: "Blanco",
    image: initialData.products[4].images[0],
  },
];

// Cálculos estáticos
const subtotal = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);
const shipping = subtotal > 50 ? 0 : 9.99;
const total = subtotal + shipping;

export default function CartPage() {
  /* redirect("/empty"); */

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título principal */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Tu Carrito de Compra
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {cartItems.length} producto{cartItems.length !== 1 ? "s" : ""} en tu
            carrito
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Sección de Items del Carrito */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Imagen del producto */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-24 sm:w-24 sm:h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={128}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 640px) 80px, 96px"
                      />
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            Talla: {item.size}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            Color: {item.color}
                          </span>
                        </div>
                      </div>

                      {/* Precio desktop */}
                      <div className="hidden sm:block text-right">
                        <p className="font-semibold text-lg text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${item.price.toFixed(2)} c/u
                        </p>
                      </div>
                    </div>

                    {/* Controles y acciones */}
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Selector - Responsive */}
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:block">
                          <QuantitySelector quantity={item.quantity} />
                        </div>
                        <div className="sm:hidden">
                          <QuantitySelector quantity={item.quantity} />
                        </div>

                        {/* Botón eliminar */}
                        <button className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200">
                          <span>Eliminar</span>
                        </button>
                      </div>

                      {/* Precio móvil */}
                      <div className="sm:hidden text-right">
                        <p className="font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${item.price.toFixed(2)} c/u
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Carrito vacío */}
            {cartItems.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <IoCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Carrito vacío
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Agrega algunos productos increíbles a tu carrito
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300"
                  >
                    <IoArrowBack className="w-5 h-5 mr-2" />
                    Continuar Comprando
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Resumen del Pedido */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Resumen del Pedido
              </h2>

              {/* Detalles de precios */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} productos)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span
                    className={`font-medium ${
                      shipping === 0 ? "text-green-600" : ""
                    }`}
                  >
                    {shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                {/* Mensaje envío gratis */}
                {subtotal < 50 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-blue-700 text-center">
                      ¡Faltan{" "}
                      <span className="font-semibold">
                        ${(50 - subtotal).toFixed(2)}
                      </span>{" "}
                      para envío gratis!
                    </p>
                  </div>
                )}

                {/* Línea separadora */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
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
                    <IoShieldCheckmark className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Envío gratis en pedidos +$50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoShieldCheckmark className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Devolución gratuita 30 días</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoShieldCheckmark className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Pago seguro SSL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
