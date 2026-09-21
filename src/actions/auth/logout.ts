"use server";

import { signOut } from "../../../auth";

export async function logout() {
  try {
    await signOut();
    return { ok: true };
  } catch {
    return { ok: false, error: "Error al cerrar sesión" };
  }
}
