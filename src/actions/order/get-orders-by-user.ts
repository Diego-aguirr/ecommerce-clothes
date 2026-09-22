"use server";

import { auth } from "../../../auth";
import { getOrdersByUserService } from "@/services/order.service";

type SuccessResult = {
  ok: true;
  orders: Awaited<ReturnType<typeof getOrdersByUserService>>["orders"];
  total: number;
  totalPages: number;
  currentPage: number;
};

type ErrorResult = {
  ok: false;
  message: string;
};

export type GetOrdersByUserResult = SuccessResult | ErrorResult;

export const getOrdersByUser = async (
  page?: number,
  take?: number
): Promise<GetOrdersByUserResult> => {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: "Debe estar autenticado" };
  }

  try {
    const result = await getOrdersByUserService(session.user.id, { page, take });
    return { ok: true, ...result };
  } catch (error) {
    return { ok: false, message: "Error al obtener su historial de órdenes" };
  }
};
