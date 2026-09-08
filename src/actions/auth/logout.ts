"use server";

import { signOut } from "../../../auth";

export async function logout() {
  try {
    await signOut();
    return { ok: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { ok: false, error: "Error al cerrar sesión" };
  }
}
