"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth-utils";
import {
  getProductColors as getProductColorsService,
  createProductColor,
  deleteProductColor,
  addColorImage as addColorImageService,
  deleteColorImage as deleteColorImageService,
  reorderColorImages as reorderColorImagesService,
  getColorById,
  type CreateColorInput,
  type AddImageInput,
} from "@/services/color.service";

export type { CreateColorInput };

/**
 * Obtener todos los colores de un producto con sus imágenes
 */
export async function getProductColors(productId: string) {
  await requireAdmin();
  try {
    return await getProductColorsService(productId);
  } catch (error) {
    console.error("Error al obtener colores:", error);
    return { ok: false, message: "Error al obtener colores" };
  }
}

/**
 * Crear un nuevo color para el producto
 */
export async function createColor(input: CreateColorInput) {
  await requireAdmin();
  try {
    const result = await createProductColor(input);
    if (result.ok) {
      revalidatePath(`/admin/products/${input.productId}/colors`);
    }
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false, message: error.issues[0].message };
    }
    console.error("Error al crear color:", error);
    return { ok: false, message: "Error al crear color" };
  }
}

/**
 * Eliminar un color (solo si no tiene variantes asociadas)
 */
export async function deleteColor(colorId: string, productId: string) {
  await requireAdmin();
  try {
    const result = await deleteProductColor(colorId);
    if (result.ok) {
      revalidatePath(`/admin/products/${productId}/colors`);
    }
    return result;
  } catch (error) {
    console.error("Error al eliminar color:", error);
    return { ok: false, message: "Error al eliminar color" };
  }
}

/**
 * Agregar imagen a un color
 */
export async function addColorImage(input: AddImageInput) {
  await requireAdmin();
  try {
    const result = await addColorImageService(input);

    if (result.ok) {
      const color = await getColorById(input.productColorId);
      if (color) {
        revalidatePath(`/admin/products/${color.productId}/colors`);
      }
    }

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false, message: error.issues[0].message };
    }
    console.error("Error al agregar imagen:", error);
    return { ok: false, message: "Error al agregar imagen" };
  }
}

/**
 * Eliminar imagen de un color
 */
export async function deleteColorImage(imageId: string, productId: string) {
  await requireAdmin();
  try {
    const result = await deleteColorImageService(imageId);
    if (result.ok) {
      revalidatePath(`/admin/products/${productId}/colors`);
    }
    return result;
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    return { ok: false, message: "Error al eliminar imagen" };
  }
}

/**
 * Reordenar imágenes de un color
 */
export async function reorderColorImages(
  productColorId: string,
  imageOrders: { id: string; order: number }[]
) {
  await requireAdmin();
  try {
    const result = await reorderColorImagesService(imageOrders);

    if (result.ok) {
      const color = await getColorById(productColorId);
      if (color) {
        revalidatePath(`/admin/products/${color.productId}/colors`);
      }
    }

    return result;
  } catch (error) {
    console.error("Error al reordenar imágenes:", error);
    return { ok: false, message: "Error al reordenar imágenes" };
  }
}
