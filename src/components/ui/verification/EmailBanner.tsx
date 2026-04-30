"use client";

import { useEffect, useState } from "react";
import { resendVerificationEmail } from "@/lib/api/auth";

type Props = {
  reason: "GRACE_PERIOD" | "EMAIL_VERIFICATION_REQUIRED";
};

export default function EmailBanner({ reason }: Props) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isBlocked = reason === "EMAIL_VERIFICATION_REQUIRED";

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      await resendVerificationEmail();
      setSent(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error. Intentá nuevamente.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="status"
      className={`w-full px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm border-b
        ${
          isBlocked
            ? "bg-red-100 border-red-300 text-red-900"
            : "bg-yellow-100 border-yellow-300 text-yellow-900"
        }`}
    >
      <div className="flex-1">
        {reason === "GRACE_PERIOD" && (
          <p>Verificá tu email para evitar bloqueos en futuras compras.</p>
        )}

        {isBlocked && (
          <p className="font-medium">
            ⚠️ Debes verificar tu email para continuar con la compra.
          </p>
        )}

        {sent && (
          <p className="text-green-700 text-xs mt-1">
            Te enviamos un email. Revisá tu bandeja.
          </p>
        )}

        {error && (
          <p className="text-red-600 text-xs mt-1" role="alert">
            {error}
          </p>
        )}
      </div>

      {!sent && (
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={loading}
          aria-busy={loading}
          className="
            shrink-0
            inline-flex items-center justify-center
            px-3 py-1.5 text-xs font-medium rounded
            bg-black text-white
            cursor-pointer
            transition-colors duration-150
            hover:bg-neutral-800
            focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? "Enviando..." : "Reenviar email"}
        </button>
      )}
    </div>
  );
}
