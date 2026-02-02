import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/sendResetPasswordEmail";

/**
 * POST /api/auth/forgot-password
 *
 * Genera un token de recuperación de contraseña y envía
 * un email con el link de reset.
 *
 * ⚠️ Seguridad:
 * - La respuesta es SIEMPRE la misma, exista o no el email
 *   (previene user enumeration attacks).
 */
export async function POST(req: Request) {
  try {
    // -----------------------------
    // 1. Leer y validar input
    // -----------------------------
    const body = await req.json();
    const email = body?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    // Normalizamos el email para evitar inconsistencias
    const normalizedEmail = email.toLowerCase().trim();

    // -----------------------------
    // 2. Buscar usuario
    // -----------------------------
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    /**
     * Respuesta uniforme:
     * Nunca revelamos si el usuario existe o no.
     */
    if (!user) {
      return NextResponse.json({
        message: "If the email exists, a reset link was sent",
      });
    }

    // -----------------------------
    // 3. Limpiar tokens anteriores
    // -----------------------------
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // -----------------------------
    // 4. Generar token seguro
    // -----------------------------
    const token = crypto.randomBytes(32).toString("hex");

    // Token válido por 1 hora
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    // -----------------------------
    // 5. Persistir token
    // -----------------------------
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // -----------------------------
    // 6. Enviar email
    // -----------------------------
    await sendResetPasswordEmail({
      to: user.email,
      token,
    });

    // -----------------------------
    // 7. Respuesta final
    // -----------------------------
    return NextResponse.json({
      message: "If the email exists, a reset link was sent",
    });
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
