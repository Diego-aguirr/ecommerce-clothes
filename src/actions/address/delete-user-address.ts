"use server";

import { auth } from "../../../auth";
import { deleteUserAddressService } from "@/services/address.service";

export const deleteUserAddress = async () => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { ok: false, error: "Usuario no autenticado" };
    }

    await deleteUserAddressService(userId);
    return { ok: true, message: "Dirección eliminada correctamente" };
  } catch (error) {
    console.error("Error eliminando dirección:", error);
    return { ok: false, error: "Error interno al eliminar la dirección" };
  }
};
