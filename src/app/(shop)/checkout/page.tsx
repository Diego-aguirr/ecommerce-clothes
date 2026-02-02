import { initialData } from "@/seed  /seed";
import Link from "next/link";
import { auth } from "../../../../auth";
import { redirect } from "next/dist/client/components/navigation";
import prisma from "@/lib/prisma";
import { getEmailVerificationStatus } from "@/lib/email-verification";

// Simulamos productos del carrito basados en el seed data
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
];

export default async function PaymentPage() {
  const session = await auth();
  // 🔒 1. No logueado → login
  if (!session?.user?.id) {
    redirect("/login?redirect=/checkout");
  }

  // 🔒 2. Usuario real
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  // 🔒 3. Email bloqueado
  const verification = getEmailVerificationStatus(user);

  if (!verification.allowed) {
    redirect("/shop"); // o página informativa
  }

  // Calcular totales
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 50000 ? 0 : 2500; // Envío gratis sobre $50.000
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-brand-primary">
            URBANWEAR
          </Link>
        </div>

        {/* Breadcrumbs */}
        <div className="flex justify-center items-center text-sm mb-8">
          <Link
            href="/cart"
            className="text-brand-primary font-semibold hover:text-brand-accent transition-colors"
          >
            Carrito
          </Link>
          <span className="mx-3 text-gray-400">›</span>
          <Link
            href="/checkout/address"
            className="text-brand-primary font-semibold hover:text-brand-accent transition-colors"
          >
            Dirección
          </Link>
          <span className="mx-3 text-gray-400">›</span>
          <span className="text-gray-500 font-bold">Confirmación</span>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Título principal */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Confirmar Pedido
            </h1>
            <p className="text-gray-600">
              Revisa y confirma tu pedido antes de proceder
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda - Información del pedido */}
            <div className="space-y-6">
              {/* Resumen de productos */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Tu Pedido
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                    >
                      <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 px-1 text-center">
                            {item.name.split(" ")[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs text-gray-500">
                            Talla: {item.size}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            Color: {item.color}
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

              {/* Dirección de envío */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Dirección de Envío
                  </h2>
                  <Link
                    href="/checkout/address"
                    className="text-sm text-brand-accent hover:text-orange-600 font-medium transition-colors"
                  >
                    Cambiar
                  </Link>
                </div>
                <div className="space-y-2 text-gray-600">
                  <p className="font-semibold">Juan Pérez</p>
                  <p>Av. Corrientes 1234, Piso 5B</p>
                  <p>H3500AAB, Resistencia</p>
                  <p>Chaco, Argentina</p>
                  <p className="pt-2 text-sm">📱 11 2345-6789</p>
                </div>
              </div>

              {/* Información de pago */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Método de Pago
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">
                      Seleccionar al confirmar
                    </span>
                    <span className="text-sm text-gray-500">
                      Múltiples opciones
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Podrás elegir entre Mercado Pago, transferencia bancaria o
                    tarjeta de crédito después de confirmar tu pedido.
                  </p>
                </div>
              </div>
            </div>

            {/* Columna derecha - Resumen y confirmación */}
            <div className="space-y-6">
              {/* Resumen de compra */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Resumen Final
                </h2>

                {/* Detalles de precio */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} productos)</span>
                    <span className="font-medium">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span
                      className={
                        shipping === 0
                          ? "text-green-600 font-medium"
                          : "font-medium"
                      }
                    >
                      {shipping === 0
                        ? "Gratis"
                        : `$${shipping.toLocaleString()}`}
                    </span>
                  </div>

                  {/* Mensaje envío gratis */}
                  {subtotal < 50000 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <p className="text-sm text-blue-700 text-center">
                        ¡Faltan{" "}
                        <span className="font-semibold">
                          ${(50000 - subtotal).toLocaleString()}
                        </span>{" "}
                        para envío gratis!
                      </p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">IVA incluido</p>
                  </div>
                </div>

                {/* Botón de confirmación - CORREGIDO */}
                <div className="space-y-3">
                  <Link
                    href="/orders"
                    className="w-full bg-brand-primary text-white font-semibold py-4 px-6 rounded-lg hover:bg-brand-accent transition-all duration-300 flex items-center justify-center text-lg shadow-sm hover:shadow-md"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Colocar Orden
                  </Link>

                  <Link
                    href="/orders/12313"
                    className="w-full border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                  >
                    Colocar Orden
                  </Link>
                </div>

                {/* Garantías y seguridad */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
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
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Devolución gratuita hasta 30 días</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Entrega estimada: 3-5 días hábiles</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      ¿Necesitas ayuda?
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Contactanos en{" "}
                      <span className="font-semibold">
                        support@urbanwear.com
                      </span>{" "}
                      o al <span className="font-semibold">0800-123-4567</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
