"use server";

import { getCategoriesService } from "@/services/category.service";

export type GetCategoriesResult = Awaited<ReturnType<typeof getCategoriesService>>;

/**
 * Obtiene categorías paginadas con conteo de productos.
 */
export const getCategories = async (
  page?: number,
  take?: number
): Promise<GetCategoriesResult> => {
  try {
    return await getCategoriesService({ page, take });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { data: [], total: 0, totalPages: 0, currentPage: 1 } as GetCategoriesResult;
  }
};
