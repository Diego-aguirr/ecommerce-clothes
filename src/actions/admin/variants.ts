"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Esquema de validación para crear variante
const createVariantSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1, "SKU es requerido"),
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL", "UNICO", "AJUSTABLE"]),
  color: z.string().min(1, "Color es requerido"),
  stock: z.number().min(0, "Stock no puede ser negativo").default(0),
});

// Esquema para actualizar stock
const updateStockSchema = z.object({
  variantId: z.string().uuid(),
  stock: z.number().min(0, "Stock no puede ser negativo"),
  note: z.string().optional(),
});

// Esquema para toggle de estado
const toggleVariantSchema = z.object({
  variantId: z.string().uuid(),
  isActive: z.boolean(),
});

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;

/**
 * Obtener todas las variantes de un producto
 */
export async function getProductVariants(productId: string) {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: [{ color: "asc" }, { size: "asc" }],
    });

    return { ok: true, variants };
  } catch (error) {
    console.error("Error al obtener variantes:", error);
    return { ok: false, message: "Error al obtener variantes" };
  }
}

/**
 * Crear una nueva variante
 */
export async function createVariant(input: CreateVariantInput) {
  try {
    const validated = createVariantSchema.parse(input);

    // Verificar que no exista una variante con el mismo SKU
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku: validated.sku },
    });

    if (existingSku) {
      return { ok: false, message: "Ya existe una variante con ese SKU" };
    }

    // Verificar que no exista la combinación color+talla para este producto
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId: validated.productId,
        color: validated.color,
        size: validated.size,
      },
    });

    if (existingVariant) {
      return {
        ok: false,
        message: `Ya existe una variante con color ${validated.color} y talla ${validated.size}`,
      };
    }

    // Crear la variante
    const variant = await prisma.productVariant.create({
      data: validated,
    });

    // Crear movimiento de stock inicial si es > 0
    if (validated.stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: validated.productId,
          variantId: variant.id,
          type: "restock",
          quantity: validated.stock,
          note: "Stock inicial al crear variante",
        },
      });
    }

    revalidatePath(`/admin/products/${validated.productId}/variants`);
    return { ok: true, variant };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false, message: error.issues[0].message };
    }
    console.error("Error al crear variante:", error);
    return { ok: false, message: "Error al crear variante" };
  }
}

/**
 * Actualizar stock de una variante
 */
export async function updateVariantStock(input: UpdateStockInput) {
  try {
    const validated = updateStockSchema.parse(input);

    const variant = await prisma.productVariant.findUnique({
      where: { id: validated.variantId },
    });

    if (!variant) {
      return { ok: false, message: "Variante no encontrada" };
    }

    const stockDiff = validated.stock - variant.stock;

    // Actualizar stock
    await prisma.productVariant.update({
      where: { id: validated.variantId },
      data: { stock: validated.stock },
    });

    // Registrar movimiento de stock
    await prisma.stockMovement.create({
      data: {
        productId: variant.productId,
        variantId: variant.id,
        type: stockDiff >= 0 ? "restock" : "adjustment",
        quantity: stockDiff,
        note: validated.note || "Ajuste manual de stock",
      },
    });

    revalidatePath(`/admin/products/${variant.productId}/variants`);
    return { ok: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false, message: error.issues[0].message };
    }
    console.error("Error al actualizar stock:", error);
    return { ok: false, message: "Error al actualizar stock" };
  }
}

/**
 * Activar/Desactivar variante
 */
export async function toggleVariantStatus(input: { variantId: string; isActive: boolean }) {
  try {
    const validated = toggleVariantSchema.parse(input);

    const variant = await prisma.productVariant.update({
      where: { id: validated.variantId },
      data: { isActive: validated.isActive },
    });

    revalidatePath(`/admin/products/${variant.productId}/variants`);
    return { ok: true, variant };
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    return { ok: false, message: "Error al cambiar estado" };
  }
}

/**
 * Actualizar stock en bulk (múltiples variantes)
 */
export async function bulkUpdateStock(
  updates: { variantId: string; stock: number; note?: string }[]
) {
  try {
    const results = await Promise.all(
      updates.map((update) => updateVariantStock(update))
    );

    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      return {
        ok: false,
        message: `${failed.length} actualizaciones fallaron`,
      };
    }

    return { ok: true, message: "Stock actualizado correctamente" };
  } catch (error) {
    console.error("Error en bulk update:", error);
    return { ok: false, message: "Error al actualizar stock" };
  }
}
