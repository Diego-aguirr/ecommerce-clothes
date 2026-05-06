"use server";

import prisma from "@/lib/prisma";
import { Size } from "@/generated/prisma/enums";

export interface QuickVariantInfo {
  id: string;
  sku: string;
  size: Size;
  stock: number;
  color: string;
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
      
      return {
        id: anyVariant.id,
        sku: anyVariant.sku,
        size: anyVariant.size as Size,
        stock: anyVariant.stock,
        color: anyVariant.color,
      };
    }

    return {
      id: variant.id,
      sku: variant.sku,
      size: variant.size as Size,
      stock: variant.stock,
      color: variant.color,
    };
  } catch (error) {
    console.error("Error fetching variant for quick add:", error);
    return null;
  }
}
