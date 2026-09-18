"use server";

import { emailSchema } from "@/lib/zod";
import { z } from "zod";
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

    // Delegar a NextAuth Email provider:
    // - Genera token, lo hashea, lo guarda en VerificationToken
    // - Llama a sendVerificationRequest (auth.ts) que usa nuestra plantilla
    // - El link apunta a /api/auth/callback/email?token=XXX
    // - Si el usuario no existe, igual genera el token (respuesta uniforme)
    const result = await signIn("email", {
      email: email.toLowerCase(),
      redirect: false,
      callbackUrl: callbackUrl || "/",
    });

    if (result?.error) {
      return { error: "Ocurrió un error. Intentá nuevamente." };
    }

    return {
      ok: true,
      message: "Si el email está registrado, recibirás un enlace para iniciar sesión.",
    };
  } catch {
    return {
      error: "Ocurrió un error. Intentá nuevamente.",
    };
  }
};
