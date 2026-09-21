/**
 * Auth Service
 *
 * Responsabilidad: Registro de usuarios, verificación de email.
 * Usado por: auth/register action.
 *
 * Reglas:
 * - No exponer passwords en respuestas
 * - Generar tokens de verificación con expiración de 24h
 * - Usar "server-only" para evitar imports en client components
 */

import prisma from "@/lib/prisma";
import "server-only";
import crypto from "crypto";

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

/** Crea un token de verificación de email (expira en 24h). */
export async function createVerificationToken(email: string) {
  const token = crypto.randomUUID();

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return token;
}
