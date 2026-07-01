"use server";

import { getProductBySlugService } from "@/services/product.service";
import type { VariantsByColor } from "@/interfaces/product.interface";

export interface ProductWithVariants {
  id: string;
  title: string;
  description: string;
  price: number;
  slug: string;
  sizes: string[];
  tags: string[];
  gender: string;
  isActive: boolean;
  categoryId: string;
  images: string[];
  variantsByColor: VariantsByColor[];
}

export const getProductBySlug = async (
  slug: string
): Promise<ProductWithVariants | null> => {
  try {
    return await getProductBySlugService(slug);
  } catch (error) {
    console.error("Error al obtener producto por slug:", error);
    throw new Error("Error al obtener producto por slug");
  }
};
