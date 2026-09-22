/**
 * Auth Service
 *
 * Responsabilidad: Registro de usuarios y helpers de auth.
 * Usado por: auth/register action, páginas de checkout.
 *
 * Reglas:
 * - No exponer passwords en respuestas
 * - Usar "server-only" para evitar imports en client components
 */

import prisma from "@/lib/prisma";
import "server-only";

type RegisterInput = {
  name: string;
  email: string;
};

/** Verifica si un email ya está registrado. */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });
}

/** Busca usuario por ID (solo id + emailVerified — para auth checks en pages). */
export async function findUserByIdForAuth(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, emailVerified: true },
  });
}

/**
 * Crea un usuario sin password (magic links).
 * Retorna el usuario sin password.
 */
export async function createUser(data: RegisterInput) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: "user",
    },
    select: { id: true, name: true, email: true },
  });
}
