"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth-utils";
import { handleActionError } from "@/lib/errors";
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

/**
 * Obtener todos los colores de un producto con sus imágenes
 */
export async function getProductColors(productId: string) {
  await requireAdmin();
  try {
    return await getProductColorsService(productId);
  } catch (error) {
    return handleActionError(error, "getProductColors");
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
    return handleActionError(error, "createColor");
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
    return handleActionError(error, "deleteColor");
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
    return handleActionError(error, "addColorImage");
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
    return handleActionError(error, "deleteColorImage");
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
    return handleActionError(error, "reorderColorImages");
  }
}
