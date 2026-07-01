"use server";

import { Gender } from "@/generated/prisma/enums";
import { getPaginatedProductsService } from "@/services/product.service";

export const getPaginatedProductsWithImages = async ({
  page = 1,
  take = 12,
  gender,
}: {
  page?: number;
  take?: number;
  gender?: Gender;
}) => {
  try {
    return await getPaginatedProductsService({ page, take, gender });
  } catch (error) {
    throw new Error(
      `Error fetching products: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
