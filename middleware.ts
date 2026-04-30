import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// Rutas públicas
const publicRoutes = ["/"];

// Rutas de auth
const authRoutes = ["/login", "/new-account"];

// Rutas privadas
const protectedRoutes = [
  "/dashboard",
  "/admin",
  "/checkout",
];

const apiAuthPrefix = "/api/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  // API Auth
  if (pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  // Públicas
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Logueado entrando a login/register
  if (isLoggedIn && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protegidas
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!isLoggedIn && isProtectedRoute) {
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
