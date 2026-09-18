/**
 * API ROUTE: Magic Link Legacy Redirect
 * --------------------------------------
 * Links viejos apuntaban aquí. Redirigir a login con error
 * ya que no tienen el email param que NextAuth necesita.
 */

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(
    new URL("/login?error=link-expired", origin)
  );
}
