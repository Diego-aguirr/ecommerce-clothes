"use server";

import { auth } from "../../../auth";
import { getOrderByIdService } from "@/services/order.service";

export const getOrderById = async (id: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "Debe estar autenticado" };
  }

  try {
    const order = await getOrderByIdService(id);

    if (!order) {
      return { ok: true, order: null };
    }

    // Autorización: solo dueño o admin
    if (session.user.role !== "admin" && session.user.id !== order.userId) {
      return { ok: false, message: "No tiene permisos para ver esta orden" };
    }

    return { ok: true, order };
  } catch (error) {
    return { ok: false, message: "Error interno al obtener la orden" };
  }
};
