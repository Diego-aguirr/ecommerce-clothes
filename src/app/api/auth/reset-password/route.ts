import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

/**
 * POST /api/auth/reset-password
 *
 * Valida un token de recuperación y actualiza la contraseña del usuario.
 *
 * Seguridad:
 * - Valida expiración del token
 * - Elimina el token tras uso (one-time use)
 * - Usa bcrypt con salt
 */
export async function POST(req: Request) {
  try {
    // -----------------------------
    // 1. Leer y validar input
    // -----------------------------
    const body = await req.json();
    const { token, password } = body ?? {};

    if (
      !token ||
      typeof token !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { message: "Token y contraseña requeridos" },
        { status: 400 },
      );
    }

    // Hardening básico de password
    if (password.length < 8) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      );
    }

    // -----------------------------
    // 2. Buscar token + usuario
    // -----------------------------
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { message: "Token inválido o ya utilizado" },
        { status: 400 },
      );
    }

    // -----------------------------
    // 3. Verificar expiración
    // -----------------------------
    if (resetToken.expiresAt <= new Date()) {
      // Limpieza defensiva
      await prisma.passwordResetToken.delete({
        where: { token },
      });

      return NextResponse.json({ message: "Token expirado" }, { status: 400 });
    }

    // -----------------------------
    // 4. Usuario Google-only
    // -----------------------------
    /**
     * Si el usuario no tiene password,
     * significa que es un usuario OAuth (Google, etc.)
     */
    if (!resetToken.user.password) {
      return NextResponse.json(
        { message: "Este usuario utiliza login con Google" },
        { status: 400 },
      );
    }

    // -----------------------------
    // 5. Hashear nueva contraseña
    // -----------------------------
    const hashedPassword = await bcrypt.hash(password, 12);

    // -----------------------------
    // 6. Transacción atómica
    // -----------------------------
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { token },
      }),
    ]);

    // -----------------------------
    // 7. Respuesta final
    // -----------------------------
    return NextResponse.json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("[RESET_PASSWORD]", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
