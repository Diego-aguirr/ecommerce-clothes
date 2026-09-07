"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">SAURON</h1>
            <h2 className="text-lg font-medium text-gray-400 mb-2">
              Error crítico
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md">
              {error.message || "La aplicación encontró un error inesperado."}
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
