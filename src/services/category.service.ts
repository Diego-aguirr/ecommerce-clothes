/**
 * Category Service
 *
 * Responsabilidad: CRUD de categorías de productos.
 * Usado por: admin/categories actions.
 *
 * Reglas:
 * - No permitir eliminar categorías con productos asociados
 * - Validar unicidad de nombre antes de crear
 * - Usar "server-only" para evitar imports en client components
 */

import prisma from "@/lib/prisma";
import "server-only";

/** Obtiene todas las categorías con conteo de productos. */
export async function getCategoriesService() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { Product: true },
      },
    },
  });
}

/** Crea una categoría nueva. Lanza si ya existe. */
export async function createCategoryService(name: string) {
  const existing = await prisma.category.findUnique({
    where: { name },
  });

  if (existing) {
    throw new Error("Ya existe una categoría con ese nombre");
  }

  return prisma.category.create({
    data: { name },
  });
}

/**
 * Elimina una categoría.
 * Lanza si no existe o tiene productos asociados.
 */
export async function deleteCategoryService(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { Product: true },
      },
    },
  });

  if (!category) {
    throw new Error("Categoría no encontrada");
  }

  if (category._count.Product > 0) {
    throw new Error(
      `No se puede eliminar. Hay ${category._count.Product} productos usando esta categoría.`
    );
  }

  return prisma.category.delete({
    where: { id: categoryId },
  });
}
