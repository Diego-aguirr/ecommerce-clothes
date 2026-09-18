"use server";

import { emailSchema } from "@/lib/zod";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import { magicLinkEmailTemplate } from "@/lib/magic-link-email";

export const sendMagicLink = async (values: z.infer<typeof emailSchema>) => {
  try {
    const parsed = emailSchema.safeParse(values);

    if (!parsed.success) {
      return { error: "Email inválido" };
    }

    const { email } = parsed.data;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Respuesta uniforme (no revelar si el usuario existe)
    if (!user) {
      return {
        ok: true,
        message: "Si el email está registrado, recibirás un enlace para iniciar sesión.",
      };
    }

    // Limpiar tokens anteriores
    await prisma.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() },
    });

    // Generar token (5 minutos)
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      },
    });

    // Generar URL del magic link → usa callback built-in de NextAuth para crear sesión
    const magicLinkUrl = `${process.env.APP_URL}/api/auth/callback/email?token=${token}&callbackUrl=/`;

    console.log("📧 [MAGIC LINK] Generando email para:", email);
    console.log("📧 [MAGIC LINK] URL:", magicLinkUrl);

    // Enviar email
    const html = magicLinkEmailTemplate({
      name: user.name ?? email.split("@")[0],
      magicLinkUrl,
    });

    await sendEmail({
      to: email,
      subject: "Tu link para iniciar sesión",
      html,
    });

    console.log("📧 [MAGIC LINK] Email enviado exitosamente");

    return {
      ok: true,
      message: "Si el email está registrado, recibirás un enlace para iniciar sesión.",
    };
  } catch (error) {
    console.error("Magic link error:", error);

    // Retornar error genérico (no revelar detalles internos)
    return {
      error: "Ocurrió un error. Intentá nuevamente.",
    };
  }
};
