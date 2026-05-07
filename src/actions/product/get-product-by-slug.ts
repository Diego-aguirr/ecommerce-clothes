"use server";

import prisma from "@/lib/prisma";
import type { VariantsByColor, Size } from "@/interfaces/product.interface";

export interface ProductWithVariants {
  id: string;
  title: string;
  description: string;
  price: number;
  slug: string;
  sizes: Size[];
  tags: string[];
  gender: string;
  isActive: boolean;
  categoryId: string;
  images: string[];
  variantsByColor: VariantsByColor[];
}

export const getProductBySlug = async (slug: string): Promise<ProductWithVariants | null> => {
  try {
    const product = await prisma.product.findFirst({
      include: {
        ProductImage: {
          select: {
            url: true,
          },
        },
        variants: {
          where: {
            isActive: true,
          },
          orderBy: {
            size: "asc",
          },
        },
        colors: {
          include: {
            images: {
              orderBy: {
                order: "asc",
              },
              select: {
                url: true,
              },
            },
          },
          orderBy: {
            label: "asc",
          },
        },
      },
      where: {
        slug: slug,
        isActive: true,
      },
    });

    if (!product) return null;

    // ✅ NUEVO: Agrupar variantes por color
    const variantsByColor: VariantsByColor[] = product.colors.map((color) => {
      const colorVariants = product.variants.filter(
        (v) => v.color === color.color
      );

      return {
        color: color.color,
        label: color.label,
        hexCode: color.hexCode || undefined,
        images: color.images.map((img) => img.url),
        variants: colorVariants.map((v) => ({
          id: v.id,
          size: v.size,
          stock: v.stock,
          sku: v.sku,
          isActive: v.isActive,
        })),
      };
    });

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      slug: product.slug,
      sizes: product.sizes,
      tags: product.tags,
      gender: product.gender,
      isActive: product.isActive,
      categoryId: product.categoryId,
      images: product.ProductImage.map((image) => image.url),
      variantsByColor,
    };
  } catch (error) {
    console.error("Error al obtener producto por slug:", error);
    throw new Error("Error al obtener producto por slug");
  }
};
