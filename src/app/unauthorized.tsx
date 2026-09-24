import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">401</h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          No autenticado
        </h2>
        <p className="text-muted-foreground mb-6">
          Necesitás iniciar sesión para acceder a esta página.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition"
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
