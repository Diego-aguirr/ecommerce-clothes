"use server";

import prisma from "@/lib/prisma";

export const getPaginatedProductsWithImages = async () => {
  try {
    const products = await prisma.product.findMany({
      include: {
        ProductImage: {
          take: 2,
          select: { url: true },
        },
      },
    });

    console.log("Fetched products:", products);
    return {
      currentPage: 1,
      totalPages: 10,
      products: products.map((product) => ({
        ...product,
        images: product.ProductImage.map((image) => image.url),
        ProductImage: undefined,
      })),
    };
  } catch (error) {
    throw new Error("Error fetching paginated products with images: " + error);
  }
};
