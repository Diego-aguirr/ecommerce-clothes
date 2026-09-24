"use client";

import Link from "next/link";
import { useCartStore } from "@/store";
import { IoArrowBack, IoCard, IoShieldCheckmark } from "react-icons/io5";
import { currencyFormat } from "@/utils";

export const OrderSummary = () => {
  const cart = useCartStore((state) => state.cart);

  const itemsInCart = cart.reduce((sum, p) => sum + p.quantity, 0);
  const subTotal = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const IVA_RATE = 0.21;
  const total = subTotal;
  const ivaIncluido = total - total / (1 + IVA_RATE);

  return (
    <div className="bg-background rounded-lg shadow-sm border border-border p-6 sticky top-6">
      <h2 className="text-xl font-bold text-foreground mb-6">
        Resumen del Pedido
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-muted-foreground">
          <span>
            Subtotal ({itemsInCart} producto{itemsInCart !== 1 ? "s" : ""})
          </span>
          <span className="font-medium">{currencyFormat(subTotal)}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>Envío</span>
          <span className="font-medium text-foreground">
            Retiro gratis / Envío a acordar
          </span>
        </div>

<div className="border-t border-border pt-3">
           <div className="flex justify-between text-lg font-bold text-foreground">
             <span>Total</span>
             <span>{currencyFormat(total)}</span>
           </div>
           <p className="text-xs text-muted-foreground mt-1">
            IVA incluido: {currencyFormat(ivaIncluido)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/checkout/address"
          className="w-full bg-foreground text-background font-semibold py-3 px-6 rounded-lg hover:bg-muted-foreground transition-all duration-300 flex items-center justify-center"
        >
          <IoCard className="w-5 h-5 mr-2" />
          Finalizar Compra
        </Link>

        <Link
          href="/"
          className="w-full border border-input text-foreground font-medium py-3 px-6 rounded-lg hover:bg-muted transition-all duration-300 flex items-center justify-center"
        >
          <IoArrowBack className="w-5 h-5 mr-2" />
          Seguir Comprando
        </Link>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="space-y-2 text-sm text-muted-foreground">
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
