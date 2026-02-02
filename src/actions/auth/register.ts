"use server";

import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { registerSchema } from "@/lib/zod";
import { z } from "zod";
import crypto from "crypto";
import { AuthError } from "next-auth";
import { signIn } from "../../../auth";
import { sendEmail } from "@/lib/mailer";
import { verifyEmailTemplate } from "@/lib/verify-email";

export async function registerAction(data: z.infer<typeof registerSchema>) {
  try {
    // 1️⃣ Validación Zod
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
      return {
        ok: false,
        error: "Datos inválidos",
      };
    }

    const { name, email, password } = parsed.data;

    // 2️⃣ Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (existingUser) {
      const hasOAuth = existingUser.accounts.some(
        (acc) => acc.type === "oauth",
      );

      if (hasOAuth) {
        return {
          ok: false,
          error: "Este email fue registrado con Google u otro proveedor",
        };
      }

      return {
        ok: false,
        error: "El usuario ya existe",
      };
    }

    // 3️⃣ Hash seguro
    const hashedPassword = await bcryptjs.hash(password, 10);

    // 4️⃣ Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user", // explícito
      },
      select: { id: true, name: true, email: true },
    });
    // 4️⃣➕ Crear token de verificación (24h)
    const verificationToken = crypto.randomUUID();

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

    // 4️⃣➕ Armar URL de verificación
    const verifyUrl = `${process.env.APP_URL}/api/auth/verify?token=${verificationToken}`;

    // 4️⃣➕ Enviar email de confirmación
    try {
      await sendEmail({
        to: email,
        subject: "Confirmá tu correo electrónico",
        html: verifyEmailTemplate({
          name,
          verifyUrl,
        }),
      });
    } catch (err) {
      console.error("  Error enviando email de verificación:", err);
      // NO lanzar error
    }

    // 5️⃣ Login automático
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return {
      ok: true,
      user,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        error: error.cause?.err?.message,
      };
    }

    console.error(error);

    return {
      ok: false,
      error: "Error interno del servidor",
    };
  }
}
