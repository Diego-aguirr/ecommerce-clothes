import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// Rutas públicas exactas o con prefijo
const publicRoutes = [
  "/",
  "/gender",
  "/product",
  "/cart",
  "/empty",
  "/login",
  "/new-account",
  "/forgot-password",
  "/reset-password",
  "/api/webhooks",
];

// Rutas de auth
const authRoutes = ["/login", "/new-account"];

// Rutas privadas
const apiAuthPrefix = "/api/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  // API Auth
  if (pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  // Públicas (exact match o prefijo + "/")
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/"),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Logueado entrando a login/register → home
  if (isLoggedIn && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // No logueado → redirigir a login
  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
