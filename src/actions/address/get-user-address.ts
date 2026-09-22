"use server";

import { auth } from "../../../auth";
import { getUserAddressService } from "@/services/address.service";

export const getUserAddress = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { ok: false, error: "Usuario no autenticado" };
    }

    const data = await getUserAddressService(session.user.id);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: "Error interno al obtener la dirección" };
  }
};
