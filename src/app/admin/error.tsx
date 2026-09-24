"use client";

import { useCallback } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Error en el panel de administración
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Ocurrió un error inesperado
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
