"use server";

import { registerSchema } from "@/lib/zod";
import { z } from "zod";
import { signIn } from "../../../auth";
import { sendEmail } from "@/lib/mailer";
import { verifyEmailTemplate } from "@/lib/verify-email";
import {
  findUserByEmail,
  createUser,
  createVerificationToken,
} from "@/services/auth.service";

export async function registerAction(data: z.infer<typeof registerSchema>) {
  try {
    // 1. Validación Zod
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: "Datos inválidos" };
    }

    const { name, email } = parsed.data;

    // 2. Verificar si ya existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return { ok: false, error: "El email ya está en uso" };
    }

    // 3. Crear usuario (sin password)
    const user = await createUser({ name, email });

    // 4. Token de verificación + email
    const verificationToken = await createVerificationToken(email);

    if (!process.env.APP_URL) {
      console.error("⚠️ APP_URL no está definido en .env");
    }

    const verifyUrl = `${process.env.APP_URL}/api/auth/verify?token=${verificationToken}`;

    try {
      await sendEmail({
        to: email,
        subject: "Confirmá tu correo electrónico",
        html: verifyEmailTemplate({ name, verifyUrl }),
      });
    } catch (err) {
      console.error(
        "❌ Error enviando email de verificación (usuario creado igualmente):",
        err
      );
    }

    // 5. Login automático con email provider
    await signIn("email", {
      email,
      redirect: false,
    });

    return { ok: true, user };
  } catch (error) {
    console.error("Register error:", error);
    return { ok: false, error: "Error al registrar usuario" };
  }
}
