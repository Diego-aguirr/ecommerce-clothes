"use server";

import prisma from "@/lib/prisma";
import { auth } from "../../../auth";
import { z } from "zod";
import { setUserAddressSchema } from "@/lib/schemas/address.schema";

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
        error: parsed.error.issues[0]?.message || "Datos de dirección inválidos" 
      };
    }

    const { id, apartment, description, ...restData } = parsed.data;

    const existingAddress = await prisma.userAddress.findFirst({
      where: { userId },
    });

    if (existingAddress) {
      const updatedAddress = await prisma.userAddress.update({
        where: { id: existingAddress.id },
        data: {
          ...restData,
          apartment: apartment ?? null,
          description: description ?? null,
          userId,
        },
      });

      return { ok: true, data: updatedAddress };
    }

    const newAddress = await prisma.userAddress.create({
      data: {
        ...restData,
        apartment: apartment ?? null,
        description: description ?? null,
        userId,
      },
    });

    return { ok: true, data: newAddress };
  } catch (error) {
    return { ok: false, error: "Error interno al guardar la dirección" };
  }
};
