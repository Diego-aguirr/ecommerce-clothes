import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Perfil | Satoru Store",
  description: "Gestioná tus datos personales y preferencias de cuenta.",
};

import { redirect } from "next/navigation";
import { auth } from "../../../../auth";

export default async function ProfilePage() {
  const session = await auth();

  // Redirigir si no está autenticado
  if (!session?.user) {
    redirect("/");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-background rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Perfil de Usuario
          </h1>
          <p className="text-muted-foreground mt-2">Información de tu cuenta</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Datos del usuario */}
          <div className="bg-background rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Datos Personales
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="text-lg font-medium">
                  {user.name || "No especificado"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <p className="text-lg font-medium capitalize">
                  {user.role || "Usuario"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">ID de usuario</p>
                <p className="text-lg font-medium text-foreground font-mono text-sm break-all">
                  {user.id}
                </p>
              </div>
            </div>
          </div>

          {/* Sesión actual */}
          <div className="bg-background rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Sesión Actual
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de expiración</p>
                <p className="text-lg font-medium">
                  {session?.expires
                    ? new Date(session.expires).toLocaleString()
                    : "No disponible"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
