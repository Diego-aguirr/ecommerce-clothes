import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getEmailVerificationStatus } from "@/lib/email-verification";
import { auth } from "../../../../../auth";

import { OrderItems } from "./ui/OrderItems";
import { PlaceOrder } from "./ui/PlaceOrder";
import { AddressDetails } from "./ui/AddressDetails";

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
              <OrderItems />

              <AddressDetails userId={user.id} />

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
              <PlaceOrder />
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
