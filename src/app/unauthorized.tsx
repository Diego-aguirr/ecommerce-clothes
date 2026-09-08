import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">401</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          No autenticado
        </h2>
        <p className="text-gray-500 mb-6">
          Necesitás iniciar sesión para acceder a esta página.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
