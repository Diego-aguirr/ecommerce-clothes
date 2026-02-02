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
 * 2) Verifica que exista y no esté vencido
 * 3) Marca el email del usuario como verificado
 * 4) Elimina el token (one-time use)
 * 5) REDIRIGE AL USUARIO (HOME o CART)
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

  // 3️⃣ Marcar email como verificado
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // 4️⃣ Eliminar token (uso único)
  await prisma.verificationToken.delete({
    where: { token },
  });

  // 5️⃣ REDIRECCIÓN FINAL
  // 👉 HOME
  return NextResponse.redirect(new URL("/?emailVerified=1", req.url));

  // 👉 Si quisieras mandarlo al carrito:
  // return NextResponse.redirect(
  //   new URL("/cart?emailVerified=1", req.url),
  // );
}
