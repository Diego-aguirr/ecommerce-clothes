"use client";

import Link from "next/link";
import { useAddressStore } from "@/store";
import { useState } from "react";

export const AddressDetails = () => {
  const address = useAddressStore((state) => state.address);
  const shippingMethod = useAddressStore((state) => state.shippingMethod);
  const [mounted, setMounted] = useState(true);

  if (!mounted) {
    return (
      <div className="bg-background rounded-xl shadow-sm border border-border p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Si no hay información de envío en el store, redirigir al paso anterior
  if (!shippingMethod || (!address.fullname && shippingMethod === "delivery")) {
    return (
<div className="bg-background rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            Información de Envío
          </h2>
          <Link
            href="/checkout/address"
            className="text-sm text-foreground hover:text-primary font-medium transition-colors"
          >
            Agregar
          </Link>
        </div>
        <div className="space-y-2 text-muted-foreground">
          <p>No tienes una dirección configurada para este pedido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">
          {shippingMethod === "delivery" ? "Dirección de Envío" : "Retiro en Local"}
        </h2>
        <Link
          href="/checkout/address"
          className="text-sm text-foreground hover:text-primary font-medium transition-colors"
        >
          Cambiar
        </Link>
      </div>
      
      {shippingMethod === "pickup" ? (
        <div className="space-y-3 bg-primary/10 border border-primary/20 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="font-semibold text-primary-foreground">Av. Ejemplo 1234, Ciudad Autónoma 📌</p>
              <p className="text-sm text-primary mt-1">
                A nombre de: <span className="font-bold">{address.fullname || "El titular de la cuenta"}</span>
              </p>
              <p className="text-sm text-primary mt-1">📱 {address.phone}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-muted-foreground">
          <p className="font-semibold">{address.fullname}</p>
          <p>
            {address.street} {address.apartment && `, ${address.apartment}`}
          </p>
          <p>
            {address.zip}, {address.city}
          </p>
          <p>{address.provinceId}</p>
          <p className="pt-2 text-sm">📱 {address.phone}</p>
          {address.description && (
            <p className="pt-2 text-sm text-muted-foreground italic">
              Nota: {address.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
