"use server";

import { getCategoriesService } from "@/services/category.service";

/**
 * Obtiene todas las categorías con conteo de productos.
 */
export const getCategories = async () => {
  try {
    return await getCategoriesService();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
