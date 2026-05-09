"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth-utils";
import { revalidatePath } from "next/cache";
import { CreateCategorySchema, DeleteCategorySchema } from "@/lib/validations/category.schema";

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { Product: true }
        }
      }
    });
    return { ok: true, categories };
  } catch (error: unknown) {
    console.error("Error fetching categories:", error);
    return { ok: false, error: "Error al cargar las categorías" };
  }
}

export async function createCategory(name: string) {
  await requireAdmin();

  const parsed = CreateCategorySchema.safeParse({ name });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    // Verificar si ya existe (case-insensitive search opcional, pero Prisma lo hace con name en este caso exacto)
    const existing = await prisma.category.findUnique({
      where: { name: parsed.data.name }
    });

    if (existing) {
      return { ok: false, error: "Ya existe una categoría con ese nombre" };
    }

    const category = await prisma.category.create({
      data: { name: parsed.data.name }
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    return { ok: true, category };
  } catch (error: unknown) {
    console.error("Error creating category:", error);
    return { ok: false, error: "Error al crear la categoría" };
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  const parsed = DeleteCategorySchema.safeParse({ categoryId: id });
  if (!parsed.success) {
    return { ok: false, error: "ID inválido" };
  }

  try {
    // Validar si tiene productos asociados
    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
      include: {
        _count: {
          select: { Product: true }
        }
      }
    });

    if (!category) {
      return { ok: false, error: "Categoría no encontrada" };
    }

    if (category._count.Product > 0) {
      return { ok: false, error: `No se puede eliminar. Hay ${category._count.Product} productos usando esta categoría.` };
    }

    await prisma.category.delete({
      where: { id: parsed.data.categoryId }
    });

    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (error: unknown) {
    console.error("Error deleting category:", error);
    return { ok: false, error: "Error al eliminar la categoría" };
  }
}
