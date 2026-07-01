/**
 * Province Service
 *
 * Responsabilidad: Gestión de provincias argentinas.
 * Usado por: provincies actions, order.service.
 *
 * Reglas:
 * - Auto-seedear si la tabla está vacía
 * - Datos fuente: src/seed/seed-province.ts
 * - Usar "server-only" para evitar imports en client components
 */

import prisma from "@/lib/prisma";
import "server-only";
import { provinces } from "@/seed/seed-province";

/**
 * Asegura que las provincias existan en la DB.
 * Si no hay registros, las crea automáticamente.
 * Retorna true si hay provincias disponibles.
 */
export async function ensureProvincesExistService(): Promise<boolean> {
  const count = await prisma.province.count();

  if (count > 0) return true;

  await prisma.province.createMany({
    data: provinces,
    skipDuplicates: true,
  });

  return true;
}

/** Obtiene todas las provincias ordenadas por nombre. */
export async function getProvincesService() {
  await ensureProvincesExistService();

  return prisma.province.findMany({
    orderBy: { name: "asc" },
  });
}

/** Valida que una provincia exista por ID. */
export async function validateProvinceService(provinceId: string) {
  const province = await prisma.province.findUnique({
    where: { id: provinceId },
  });

  if (!province) {
    throw new Error(
      "La provincia seleccionada no es válida. Por favor, actualizá tu dirección de envío."
    );
  }

  return province;
}
