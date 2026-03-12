"use server";

import prisma from "@/lib/prisma";
import { auth } from "../../../auth";

export const deleteUserAddress = async () => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { ok: false, error: "Usuario no autenticado" };
    }

    // Eliminamos todas las direcciones asociadas a este usuario
    await prisma.userAddress.deleteMany({
      where: { userId },
    });

    return { ok: true, message: "Dirección eliminada correctamente" };
  } catch (error) {
    console.error("Error eliminando dirección:", error);
    return { ok: false, error: "Error interno al eliminar la dirección" };
  }
};
