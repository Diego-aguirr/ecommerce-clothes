"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Esquema de validación para crear color
const createColorSchema = z.object({
  productId: z.string().uuid(),
  color: z.string().min(1, "Nombre técnico del color es requerido"),
  label: z.string().min(1, "Nombre mostrado es requerido"),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Formato de color inválido (ej: #FF0000)").optional(),
});

// Esquema para agregar imagen a color
const addImageSchema = z.object({
  productColorId: z.string().uuid(),
  url: z.string().url("URL inválida"),
  order: z.number().default(0),
});

export type CreateColorInput = z.infer<typeof createColorSchema>;

/**
 * Obtener todos los colores de un producto con sus imágenes
 */
export async function getProductColors(productId: string) {
  try {
    const colors = await prisma.productColor.findMany({
      where: { productId },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { images: true },
        },
      },
      orderBy: { label: "asc" },
    });

    return { ok: true, colors };
  } catch (error) {
    console.error("Error al obtener colores:", error);
    return { ok: false, message: "Error al obtener colores" };
  }
}

/**
 * Crear un nuevo color para el producto
 */
export async function createColor(input: CreateColorInput) {
  try {
    const validated = createColorSchema.parse(input);

    // Verificar que no exista un color con el mismo nombre técnico
    const existing = await prisma.productColor.findFirst({
      where: {
        productId: validated.productId,
        color: validated.color,
      },
    });

    if (existing) {
      return {
        ok: false,
        message: `Ya existe un color con el nombre '${validated.color}'`,
      };
    }

    const color = await prisma.productColor.create({
      data: validated,
    });

    revalidatePath(`/admin/products/${validated.productId}/colors`);
    return { ok: true, color };
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
  try {
    // Verificar si hay variantes usando este color
    const variantsCount = await prisma.productVariant.count({
      where: { color: colorId },
    });

    if (variantsCount > 0) {
      return {
        ok: false,
        message: `No se puede eliminar: hay ${variantsCount} variantes usando este color`,
      };
    }

    await prisma.productColor.delete({
      where: { id: colorId },
    });

    revalidatePath(`/admin/products/${productId}/colors`);
    return { ok: true };
  } catch (error) {
    console.error("Error al eliminar color:", error);
    return { ok: false, message: "Error al eliminar color" };
  }
}

/**
 * Agregar imagen a un color
 */
export async function addColorImage(input: {
  productColorId: string;
  url: string;
  order?: number;
}) {
  try {
    const validated = addImageSchema.parse(input);

    const image = await prisma.productColorImage.create({
      data: validated,
    });

    const color = await prisma.productColor.findUnique({
      where: { id: validated.productColorId },
    });

    if (color) {
      revalidatePath(`/admin/products/${color.productId}/colors`);
    }

    return { ok: true, image };
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
  try {
    await prisma.productColorImage.delete({
      where: { id: imageId },
    });

    revalidatePath(`/admin/products/${productId}/colors`);
    return { ok: true };
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
  try {
    await Promise.all(
      imageOrders.map((item) =>
        prisma.productColorImage.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    const color = await prisma.productColor.findUnique({
      where: { id: productColorId },
    });

    if (color) {
      revalidatePath(`/admin/products/${color.productId}/colors`);
    }

    return { ok: true };
  } catch (error) {
    console.error("Error al reordenar imágenes:", error);
    return { ok: false, message: "Error al reordenar imágenes" };
  }
}
