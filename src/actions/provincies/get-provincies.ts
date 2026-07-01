"use server";

import { getProvincesService } from "@/services/province.service";

/**
 * Obtiene las provincias de la base de datos.
 * Si no hay provincias, las seedea automáticamente.
 */
export const getProvincies = async () => {
  try {
    return await getProvincesService();
  } catch (error) {
    console.error("Error fetching provincies:", error);
    return [];
  }
};
