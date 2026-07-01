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

      if (!result.ok || !("init_point" in result) || !result.init_point) {
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
        className={`w-full py-3.5 px-4 rounded-xl text-white font-bold transition-all flex justify-center items-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#111] hover:bg-[#333] active:scale-[0.98]"
        }`}
      >
        {loading
          ? "Procesando redirección..."
          : "Pagar con Mercado Pago"}
      </button>
    </div>
  );
};
