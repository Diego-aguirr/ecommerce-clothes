/**
 * User Service
 *
 * Responsabilidad: Operaciones de negocio sobre usuarios.
 * Solo acciones admin llaman a estos métodos (bloqueo, cambio de rol).
 *
 * Reglas:
 * - Todos los métodos verifican permisos en la capa action (requireAdmin)
 * - No exponer datos sensibles (password, tokens)
 * - Usar "server-only" para evitar imports en client components
 */

import prisma from "@/lib/prisma";
import "server-only";
import { UserStatus, Role } from "@/generated/prisma/enums";

/** Bloquea o activa un usuario. Solo admin. */
export async function toggleUserBlockService(userId: string, isBlocked: boolean) {
  const status = isBlocked ? UserStatus.BLOCKED : UserStatus.ACTIVE;

  return prisma.user.update({
    where: { id: userId },
    data: { status },
  });
}

/** Cambia el rol de un usuario. Solo super admin. */
export async function updateUserRoleService(userId: string, role: Role) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}
