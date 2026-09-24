import Link from "next/link";

export default function ForbiddenPage() {
  return (
<div className="min-h-screen flex items-center justify-center bg-muted">
       <div className="text-center">
         <h1 className="text-4xl font-bold text-foreground mb-2">403</h1>
         <h2 className="text-xl font-semibold text-foreground mb-4">
           Acceso denegado
         </h2>
         <p className="text-muted-foreground mb-6">
           No tenés permisos para acceder a esta sección.
         </p>
         <Link
           href="/"
           className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary/90 transition"
         >
           Volver al inicio
         </Link>
      </div>
    </div>
  );
}
