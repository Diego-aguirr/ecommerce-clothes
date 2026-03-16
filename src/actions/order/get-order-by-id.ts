"use server";

import { auth } from "../../../auth";
import prisma from "@/lib/prisma";

export const getOrderById = async (id: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false,
      message: "Debe estar autenticado",
    };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },

      include: {
        OrderAddress: {
          include: {
            province: {
              select: {
                name: true,
              },
            },
          },
        },

        OrderItem: {
          select: {
            price: true,
            quantity: true,
            size: true,

            product: {
              select: {
                title: true,
                slug: true,

                ProductImage: {
                  select: { url: true },
                  orderBy: { id: "asc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return { ok: true, order: null };
    }

    if (session.user.role !== "admin" && session.user.id !== order.userId) {
      return {
        ok: false,
        message: "No tiene permisos para ver esta orden",
      };
    }

    return {
      ok: true,
      order,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "Error al obtener la orden",
    };
  }
};
