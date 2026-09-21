"use server";

import { signIn } from "../../../auth";
import { isLocalUrl } from "@/lib/url";

export async function signInWithGoogle(callbackUrl?: string) {
  try {
    const target = isLocalUrl(callbackUrl || "") ? callbackUrl : "/";

    await signIn("google", {
      redirectTo: target,
      redirect: true,
    });

    return { ok: true };
  } catch (error) {
    // NextAuth lanza redirect como excepción con redirect: true — es comportamiento normal
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { ok: false, error: "Error al iniciar sesión con Google" };
  }
}
