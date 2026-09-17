/**
 * API ROUTE: Magic Link Validation
 * --------------------------------
 * Este endpoint se ejecuta cuando el usuario hace click
 * en el link mágico que llega por email:
 *
 *   /api/auth/magic-link?token=XXXX
 *
 * Flujo:
 * 1) Lee el token desde la URL
 * 2) Verifica que exista y no esté vencido
 * 3) Genera JWT para el usuario
 * 4) Elimina el token (one-time use)
 * 5) REDIRIGE AL USUARIO (HOME)
 *
 * ⚠️ IMPORTANTE:
 * El link del email DEBE apuntar a /api/auth/magic-link
 * NO a /auth/magic-link
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signIn } from "../../../../../auth";

export async function GET(req: Request) {
  // 1️⃣ Obtener token desde la URL
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  // ❌ Token inexistente
  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=invalid-token", req.url),
    );
  }

  // 2️⃣ Buscar token en DB
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  // ❌ Token no existe
  if (!verificationToken) {
    return NextResponse.redirect(
      new URL("/login?error=token-expired", req.url),
    );
  }

  // ❌ Token vencido
  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.redirect(
      new URL("/login?error=token-expired", req.url),
    );
  }

  // 3️⃣ Buscar usuario por email (identifier)
  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier },
  });

  // ❌ Usuario no existe
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=invalid-token", req.url),
    );
  }

  // 4️⃣ Generar JWT y hacer login
  await signIn("email", {
    email: user.email,
    redirect: false,
  });

  // 5️⃣ Eliminar token (uso único)
  await prisma.verificationToken.delete({
    where: { token },
  });

  // 6️⃣ REDIRECCIÓN FINAL → HOME
  return NextResponse.redirect(new URL("/", req.url));
}
