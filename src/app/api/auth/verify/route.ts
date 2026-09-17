/**
 * API ROUTE: Verificación de email
 * --------------------------------
 * Este endpoint se ejecuta cuando el usuario hace click
 * en el link que llega por email:
 *
 *   /api/auth/verify?token=XXXX
 *
 * Flujo:
 * 1) Lee el token desde la URL
 * 2) Elimina el token atómicamente (uso único, previene race condition)
 * 3) Verifica que no esté vencido
 * 4) Marca el email del usuario como verificado
 * 5) REDIRIGE AL USUARIO (HOME)
 *
 * ⚠️ IMPORTANTE:
 * El link del email DEBE apuntar a /api/auth/verify
 * NO a /auth/verify
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

  // 2️⃣ Eliminar token atómicamente (previene race condition)
  let verificationToken;
  try {
    verificationToken = await prisma.verificationToken.delete({
      where: { token },
    });
  } catch {
    // Token no existe o ya fue eliminado
    return NextResponse.redirect(
      new URL("/login?error=token-expired", req.url),
    );
  }

  // 3️⃣ Verificar que no esté vencido
  if (verificationToken.expires < new Date()) {
    return NextResponse.redirect(
      new URL("/login?error=token-expired", req.url),
    );
  }

  // 4️⃣ Marcar email como verificado
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // 5️⃣ REDIRECCIÓN FINAL → HOME
  return NextResponse.redirect(new URL("/?emailVerified=1", req.url));
}
