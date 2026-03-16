"use server";

import { auth } from "../../../auth";
import prisma from "@/lib/prisma";

export const getOrdersByUser = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false,
      message: "Debe estar autenticado",
    };
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        total: true,
        isPaid: true,
        createdAt: true,
        status: true,
        OrderAddress: {
          select: {
            fullname: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      ok: true,
      orders,
    };
  } catch (error) {
    console.error("Error getOrdersByUser:", error);
    return {
      ok: false,
      message: "Error al obtener su historial de órdenes",
    };
  }
};
