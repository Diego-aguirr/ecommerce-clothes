"use server";

import { loginSchema } from "@/lib/zod";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "../../../auth";

export const authenticate = async (values: z.infer<typeof loginSchema>) => {
  try {
    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      return { error: "Datos inválidos" };
    }

    const { email, password } = parsed.data;

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Credenciales inválidas" };
    }

    return { error: "Error interno" };
  }
};
