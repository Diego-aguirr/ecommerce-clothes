/**
 * API ROUTE: Magic Link Redirect
 * --------------------------------
 * Redirige links viejos al callback built-in de NextAuth.
 * Los links nuevos apuntan directamente a /api/auth/callback/email.
 */

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", req.url));
  }

  // Redirigir al callback de NextAuth que crea la sesión correctamente
  return NextResponse.redirect(
    new URL(`/api/auth/callback/email?token=${token}&callbackUrl=/`, req.url)
  );
}
