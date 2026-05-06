"use server";

import prisma from "@/lib/prisma";

export const getStockBySlug = async (slug: string): Promise<number> => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug },
      include: {
        variants: {
          where: { isActive: true },
          select: { stock: true },
        },
      },
    });

    if (!product) return 0;

    // Sumar stock de todas las variantes activas
    return product.variants.reduce((total, variant) => total + variant.stock, 0);
  } catch (error) {
    return 0;
  }
};
