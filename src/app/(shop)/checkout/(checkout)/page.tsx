import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Satoru Store",
  description: "Confirmá tu pedido y elegí tu método de pago preferido.",
};

import Link from "next/link";
import { redirect } from "next/navigation";
import { findUserByIdForAuth } from "@/services/auth.service";
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
  const user = await findUserByIdForAuth(session.user.id);

  if (!user) {
    redirect("/login");
  }

  // 🔒 3. Email no verificado → shop
  if (!user.emailVerified) {
    redirect("/shop");
  }

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="container mx-auto px-4">
        {/* Header (Limpio) */}
        <div className="mt-4"></div>

        {/* Breadcrumbs */}
        <div className="flex justify-center items-center text-sm mb-8">
          <Link
            href="/cart"
            className="text-foreground font-semibold hover:text-muted-foreground transition-colors"
          >
            Carrito
          </Link>
          <span className="mx-3 text-muted-foreground">›</span>
          <Link
            href="/checkout/address"
            className="text-foreground font-semibold hover:text-muted-foreground transition-colors"
          >
            Dirección
          </Link>
          <span className="mx-3 text-muted-foreground">›</span>
          <span className="text-muted-foreground font-bold">Confirmación</span>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Título principal */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Confirmar Pedido
            </h1>
            <p className="text-muted-foreground">
              Revisa y confirma tu pedido antes de proceder
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda - Información del pedido */}
            <div className="space-y-6">
              <OrderItems />

              <AddressDetails />

              {/* Información de pago */}
<div className="bg-background rounded-xl shadow-sm border border-border p-6">
                 <h2 className="text-xl font-bold text-foreground mb-4">
                   Método de Pago
                 </h2>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                     <span className="font-medium">
                       Seleccionar al confirmar
                     </span>
                     <span className="text-sm text-muted-foreground">
                       Múltiples opciones
                     </span>
                   </div>
                   <p className="text-sm text-muted-foreground">
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
<div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                 <div className="flex items-start gap-3">
                   <svg
                     className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0"
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
<p className="text-sm text-primary font-medium">
                       ¿Necesitas ayuda?
                     </p>
                     <p className="text-sm text-primary mt-1">
                      Contactanos por WhatsApp o al email{" "}
                      <span className="font-semibold">tuecommerce@email.com</span>
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
