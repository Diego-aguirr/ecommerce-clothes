/**
 * API ROUTE: verify (stub de degradación).
 *
 * La verificación de email ahora ocurre al iniciar sesión (magic link o
 * Google). Este endpoint redirige a `/login?error=link-expired` para
 * compatibilidad con enlaces de verificación enviados antes del despliegue.
 */

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(new URL("/login?error=link-expired", origin));
}
