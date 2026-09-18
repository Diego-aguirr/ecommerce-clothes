"use server";

import { emailSchema } from "@/lib/zod";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { signIn } from "../../../auth";

export const sendMagicLink = async (
  values: z.infer<typeof emailSchema>,
  callbackUrl?: string
) => {
  try {
    const parsed = emailSchema.safeParse(values);

    if (!parsed.success) {
      return { error: "Email inválido" };
    }

    const { email } = parsed.data;

    // Buscar usuario (solo para verificar existencia — respuesta uniforme)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    // Respuesta uniforme (no revelar si el usuario existe)
    if (!user) {
      return {
        ok: true,
        message: "Si el email está registrado, recibirás un enlace para iniciar sesión.",
      };
    }

    // Delegar a NextAuth Email provider:
    // - Genera token, lo hashea, lo guarda en VerificationToken
    // - Llama a sendVerificationRequest (auth.ts) que usa nuestra plantilla
    // - El link apunta a /api/auth/callback/email?token=XXX
    await signIn("email", {
      email: email.toLowerCase(),
      redirect: false,
      callbackUrl: callbackUrl || "/",
    });

    return {
      ok: true,
      message: "Si el email está registrado, recibirás un enlace para iniciar sesión.",
    };
  } catch (error) {
    // signIn con redirect: false puede lanzar un error con status 200
    // cuando el email se envió correctamente — esto es normal
    if (error instanceof Error && error.message.includes("_EMAIL_SENT")) {
      return {
        ok: true,
        message: "Si el email está registrado, recibirás un enlace para iniciar sesión.",
      };
    }

    console.error("Magic link error:", error);

    return {
      error: "Ocurrió un error. Intentá nuevamente.",
    };
  }
};
