"use server";

import { Gender } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";

interface PaginationOptions {
  page?: number;
  take?: number;
  gender?: Gender;
}

export const getPaginatedProductsWithImages = async ({
  page = 1,
  take = 12,
  gender,
}: PaginationOptions) => {
  if (isNaN(Number(page))) page = 1;
  if (page < 1) page = 1;
  if (page > 1000) page = 1; // Cap razonable, evitar offsets gigantes

  if (isNaN(Number(take))) take = 12;
  if (take < 1) take = 1;
  if (take > 100) take = 100;

  try {
    const whereCondition = gender
      ? { gender, isActive: true }
      : { isActive: true };

    // Contar total primero para capar page correctamente
    const totalProducts = await prisma.product.count({
      where: whereCondition,
    });

    const totalPages = Math.ceil(totalProducts / take);
    
    // Si la página excede el total, ir a la última disponible
    if (totalPages > 0 && page > totalPages) {
      page = totalPages;
    }

    const products = await prisma.product.findMany({
        where: whereCondition,
        take: take,
        skip: (page - 1) * take,
        include: {
          ProductImage: {
            take: 2,
            select: { url: true },
          },
        },
      });

    return {
      currentPage: page,
      totalPages: totalPages,
      products: products.map(({ ProductImage, ...product }) => ({
        ...product,
        images: ProductImage.map((image) => image.url),
      })),
    };
  } catch (error) {
    throw new Error(
      `Error fetching products: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
