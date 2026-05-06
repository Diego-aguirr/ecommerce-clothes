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
      select: {
        id: true,
        subTotal: true,
        tax: true,
        shipping: true,
        total: true,
        itemsInOrder: true,
        shippingMethod: true,
        isPaid: true,
        paidAt: true,
        status: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        OrderAddress: {
          select: {
            fullname: true,
            street: true,
            apartment: true,
            zip: true,
            city: true,
            phone: true,
            dni: true,
            description: true,
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
            color: true,
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

    // Autorización: solo dueño o admin
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
    console.error("Error getOrderById:", error);
    return {
      ok: false,
      message: "Error interno al obtener la orden",
    };
  }
};
