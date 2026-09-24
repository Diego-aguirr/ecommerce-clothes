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
           Algo salió mal
         </h2>
         <p className="text-muted-foreground text-sm mb-4">
           Error en el checkout
         </p>
         <button
           onClick={reset}
           className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition"
         >
           Intentar de nuevo
         </button>
      </div>
    </div>
  );
}
