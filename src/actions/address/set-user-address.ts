"use server";

import { auth } from "../../../auth";
import { z } from "zod";
import { setUserAddressSchema } from "@/lib/schemas/address.schema";
import { setUserAddressService } from "@/services/address.service";

export type SetUserAddressInput = z.infer<typeof setUserAddressSchema>;

export const setUserAddress = async (data: SetUserAddressInput) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { ok: false, error: "Usuario no autenticado" };
    }

    const parsed = setUserAddressSchema.safeParse(data);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message || "Datos de dirección inválidos",
      };
    }

    const {
      apartment,
      description,
      shippingMethod,
      street,
      zip,
      city,
      provinceId,
      ...restData
    } = parsed.data;

    const result = await setUserAddressService(userId, {
      ...restData,
      street,
      zip,
      city,
      provinceId,
      apartment,
      description,
      shippingMethod,
    });

    return { ok: true, data: result };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return { ok: false, error: "Error interno al guardar la dirección" };
  }
};
