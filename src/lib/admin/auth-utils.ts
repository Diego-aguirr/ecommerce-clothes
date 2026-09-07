import { forbidden, unauthorized } from "next/navigation";
import { auth } from "../../../auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    unauthorized(); // 401 — no autenticado
  }
  if (session.user.role !== "admin") {
    forbidden(); // 403 — no autorizado (rol insuficiente)
  }
  return session.user;
}

export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) {
    unauthorized(); // 401 — no autenticado
  }
  const user = session.user as { role: string; isSuperAdmin?: boolean; id: string };
  if (user.role !== "admin" || !user.isSuperAdmin) {
    forbidden(); // 403 — no autorizado (superadmin requerido)
  }
  return user;
}
