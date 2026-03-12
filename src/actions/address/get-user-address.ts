"use server";

import prisma from "@/lib/prisma";
import { auth } from "../../../auth";

export const getUserAddress = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { ok: false, error: "Usuario no autenticado" };
    }

    const address = await prisma.userAddress.findFirst({
      where: { userId: session.user.id },
    });

    if (!address) {
      return { ok: true, data: null };
    }

    const { id, userId, sessionId, createdAt, updatedAt, ...rest } = address;

    return {
      ok: true,
      data: {
        ...rest,
        apartment: rest.apartment ?? undefined,
        description: rest.description ?? undefined,
      },
    };
  } catch (error) {
    console.error("Error obteniendo dirección:", error);

    return {
      ok: false,
      error: "Error interno al obtener la dirección",
    };
  }
};
