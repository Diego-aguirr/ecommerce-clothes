"use server";

import { requireAdmin } from "@/lib/admin/auth-utils";
import { revalidatePath } from "next/cache";
import {
  CreateCategorySchema,
  DeleteCategorySchema,
} from "@/lib/validations/category.schema";
import {
  getCategoriesService,
  createCategoryService,
  deleteCategoryService,
} from "@/services/category.service";

export async function getCategories() {
  try {
    const categories = await getCategoriesService();
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
    const category = await createCategoryService(parsed.data.name);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    return { ok: true, category };
  } catch (error: unknown) {
    console.error("Error creating category:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al crear la categoría",
    };
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  const parsed = DeleteCategorySchema.safeParse({ categoryId: id });
  if (!parsed.success) {
    return { ok: false, error: "ID inválido" };
  }

  try {
    await deleteCategoryService(parsed.data.categoryId);
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (error: unknown) {
    console.error("Error deleting category:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al eliminar la categoría",
    };
  }
}
