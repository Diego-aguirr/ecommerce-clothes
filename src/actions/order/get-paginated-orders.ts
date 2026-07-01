"use server";

import { auth } from "../../../auth";
import { getPaginatedOrdersService } from "@/services/order.service";

export const getPaginatedOrders = async () => {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return { ok: false, message: "Debe ser administrador" };
  }

  try {
    const orders = await getPaginatedOrdersService();
    return { ok: true, orders };
  } catch (error) {
    console.error("Error getPaginatedOrders:", error);
    return { ok: false, message: "Error al obtener órdenes" };
  }
};
