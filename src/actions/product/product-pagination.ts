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

  if (isNaN(Number(take))) take = 12;
  if (take < 1) take = 1;
  if (take > 100) take = 100; // Prevenir consultas muy grandes

  try {
    //Obtenemos datos de productos con paginación e imágenes

    // isActive: true → solo mostramos productos activos en la tienda pública
    const whereCondition = gender
      ? { gender, isActive: true }
      : { isActive: true };

    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where: whereCondition,
        take: take,
        skip: (page - 1) * take,
        include: {
          ProductImage: {
            take: 2,
            select: { url: true },
          },
        },
      }),
      // Total de productos activos (para calcular páginas correctamente)
      prisma.product.count({
        where: whereCondition,
      }),
    ]);

    // Obetenemos el total de paginas
    //todo:
    const totalPages = Math.ceil(totalProducts / take);
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
