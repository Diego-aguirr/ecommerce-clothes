"use client";

import { useState } from "react";
import { createPreference } from "@/actions";

interface Props {
  orderId: string;
  amount: number;
}

export const MercadoPagoButton = ({ orderId, amount }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Llamar al action del servidor
      const result = await createPreference(orderId);
      console.log("Respuesta de createPreference:", result);

      if (!result.ok || !result.init_point) {
        setError(result.message || "No se pudo generar el enlace de pago");
        return;
      }

      // 🚀 Redirigir al usuario al checkout oficial de Mercado Pago
      window.location.href = result.init_point;
    } catch (err) {
      console.error(err);
      setError("Error interno al conectar con Mercado Pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-5 w-full">
      {error && (
        <span className="text-red-500 mb-2 font-bold text-center">{error}</span>
      )}
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-md text-white font-bold transition-all flex justify-center items-center ${
          loading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 shadow-md"
        }`}
      >
        {loading
          ? "Conectando con Mercado Pago..."
          : `Pagar $${amount.toLocaleString()} con Mercado Pago`}
      </button>
    </div>
  );
};
