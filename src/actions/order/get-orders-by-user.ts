"use server";

import { auth } from "../../../auth";
import { getOrdersByUserService } from "@/services/order.service";

export const getOrdersByUser = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "Debe estar autenticado" };
  }

  try {
    const orders = await getOrdersByUserService(session.user.id);
    return { ok: true, orders };
  } catch (error) {
    console.error("Error getOrdersByUser:", error);
    return { ok: false, message: "Error al obtener su historial de órdenes" };
  }
};
