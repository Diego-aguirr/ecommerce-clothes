"use server";

import { registerSchema } from "@/lib/zod";
import { z } from "zod";
import { findUserByEmail, createUser } from "@/services/auth.service";

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

    // 3. Crear usuario (sin password — el magic link del login verifica el email)
    await createUser({ name, email });

    // 4. Retornar éxito (sin login automático — el usuario ingresa con magic link)
    return { ok: true };
  } catch {
    return { ok: false, error: "Error al registrar usuario" };
  }
}
