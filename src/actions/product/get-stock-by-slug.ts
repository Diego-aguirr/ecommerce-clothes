"use server";

import { getStockBySlugService } from "@/services/product.service";

export const getStockBySlug = async (slug: string): Promise<number> => {
  try {
    return await getStockBySlugService(slug);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return 0;
  }
};
