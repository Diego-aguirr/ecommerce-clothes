"use server";

import { getStockBySlugService } from "@/services/product.service";

export const getStockBySlug = async (slug: string): Promise<number> => {
  try {
    return await getStockBySlugService(slug);
     
  } catch (_error) {
    return 0;
  }
};
