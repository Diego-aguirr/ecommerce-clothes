"use server";

import { emailSchema } from "@/lib/zod";
import { z } from "zod";
import { signIn } from "../../../auth";
import { isLocalUrl } from "@/lib/url";

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

    const safeCallbackUrl = isLocalUrl(callbackUrl || "") ? callbackUrl : "/";
    const result = await signIn("email", {
      email: email.toLowerCase(),
      redirect: false,
      callbackUrl: safeCallbackUrl,
    });

    // Respuesta uniforme: nunca revelar si el email está registrado.
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
