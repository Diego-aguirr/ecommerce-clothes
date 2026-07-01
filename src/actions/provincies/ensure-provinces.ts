"use server";

import {
  ensureProvincesExistService,
  getProvincesService,
} from "@/services/province.service";

/**
 * Verifica que las provincias existan en la DB.
 * Si no hay provincias, las crea automáticamente.
 */
export async function ensureProvincesExist(): Promise<boolean> {
  try {
    return await ensureProvincesExistService();
  } catch (error) {
    console.error("❌ Error seeding provincias:", error);
    return false;
  }
}

/**
 * Obtiene las provincias, asegurándose de que existan primero
 */
export async function getProvincesWithSeed() {
  return getProvincesService();
}
