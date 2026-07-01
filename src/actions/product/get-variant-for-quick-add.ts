"use server";

import { Size } from "@/generated/prisma/enums";
import { getVariantForQuickAddService } from "@/services/product.service";

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
 * Obtiene la información de variante para el quick add.
 * Usado cuando el producto no tiene variantes precargadas (ej: grid de home).
 */
export async function getVariantForQuickAdd(
  productId: string,
  size: Size
): Promise<QuickVariantInfo | null> {
  try {
    return await getVariantForQuickAddService(productId, size);
  } catch (error) {
    console.error("Error fetching variant for quick add:", error);
    return null;
  }
}
