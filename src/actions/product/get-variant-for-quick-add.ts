"use server";

import prisma from "@/lib/prisma";
import { Size } from "@/generated/prisma/enums";

export interface QuickVariantInfo {
  id: string;
  sku: string;
  size: Size;
  stock: number;
  color: string;
  colorLabel: string;
  colorHex?: string;
}

/**
 * Obtiene la información de variante para el quick add
 * Usado cuando el producto no tiene variantes precargadas (ej: grid de home)
 */
export async function getVariantForQuickAdd(
  productId: string,
  size: Size
): Promise<QuickVariantInfo | null> {
  try {
    // Buscar la variante por productId + size
    // Si hay múltiples colores, tomamos el primero disponible
    const variant = await prisma.productVariant.findFirst({
      where: {
        productId,
        size,
        isActive: true,
        stock: { gt: 0 }, // Solo variantes con stock
      },
      orderBy: {
        stock: "desc", // Priorizar la de mayor stock
      },
    });

    if (!variant) {
      // Si no hay con stock, buscar cualquiera (para mostrar agotado)
      const anyVariant = await prisma.productVariant.findFirst({
        where: {
          productId,
          size,
          isActive: true,
        },
      });
      
      if (!anyVariant) return null;

      const colorInfo = await resolveColorInfo(productId, anyVariant.color);
      
      return {
        id: anyVariant.id,
        sku: anyVariant.sku,
        size: anyVariant.size as Size,
        stock: anyVariant.stock,
        color: anyVariant.color,
        ...colorInfo,
      };
    }

    const colorInfo = await resolveColorInfo(productId, variant.color);

    return {
      id: variant.id,
      sku: variant.sku,
      size: variant.size as Size,
      stock: variant.stock,
      color: variant.color,
      ...colorInfo,
    };
  } catch (error) {
    console.error("Error fetching variant for quick add:", error);
    return null;
  }
}

/**
 * Resuelve colorLabel y colorHex desde la tabla ProductColor.
 * Fallback: usa color.replace(/_/g, " ") como label y "#808080" como hex.
 */
async function resolveColorInfo(
  productId: string,
  color: string
): Promise<{ colorLabel: string; colorHex: string }> {
  const productColor = await prisma.productColor.findUnique({
    where: {
      productId_color: { productId, color },
    },
  });

  if (productColor) {
    return {
      colorLabel: productColor.label,
      colorHex: productColor.hexCode ?? "#808080",
    };
  }

  // Fallback si no existe fila en ProductColor
  return {
    colorLabel: color.replace(/_/g, " "),
    colorHex: "#808080",
  };
}
