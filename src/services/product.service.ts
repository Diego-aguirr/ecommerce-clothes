/**
 * Product Service
 *
 * Responsabilidad: CRUD de productos, imágenes, variantes y stock.
 * Usado por: admin/products actions.
 *
 * Reglas:
 * - Validar datos con Zod en la capa action antes de llamar al service
 * - Usar transacciones Prisma para operaciones múltiples
 * - No exponer Prisma types directamente — usar interfaces de dominio
 * - Usar "server-only" para evitar imports en client components
 */

import prisma from "@/lib/prisma";
import "server-only";
import { Size, Gender } from "@/generated/prisma/enums";

/** Activa o desactiva un producto. */
export async function toggleProductStatusService(
  productId: string,
  isActive: boolean,
) {
  return prisma.product.update({
    where: { id: productId },
    data: { isActive },
  });
}

/** Actualiza precio o título de un producto. Retorna el producto anterior para comparar. */
export async function updateProductDetailsService(
  productId: string,
  data: { price?: number; title?: string },
) {
  const oldProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  const product = await prisma.product.update({
    where: { id: productId },
    data,
  });

  return { product, oldProduct };
}

// ⚠️ DEPRECATED: Esta función ajustaba el stock global del producto.
// Ahora el stock se maneja por variantes individuales.
// Usar las funciones de variantes en src/actions/admin/variants.ts
export async function adjustProductStockService(
  productId: string,
  adjustment: number,
  type: string,
  note?: string,
) {
  // Buscar todas las variantes del producto
  const variants = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: { stock: 'asc' }
  });
  
  if (variants.length === 0) throw new Error("El producto no tiene variantes");

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const newStock = totalStock + adjustment;
  
  if (newStock < 0) throw new Error("El stock no puede ser negativo");

  // Aplicar el ajuste a la primera variante (o distribuirlo)
  const firstVariant = variants[0];
  const variantAdjustment = adjustment;

  const [updatedVariant, movement] = await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: firstVariant.id },
      data: { stock: { increment: variantAdjustment } },
    }),
    prisma.stockMovement.create({
      data: {
        productId,
        variantId: firstVariant.id,
        type,
        quantity: adjustment,
        note: note || "Ajuste de stock",
      },
    }),
  ]);

  return { 
    updatedVariant, 
    movement, 
    previousStock: totalStock,
    message: "Stock ajustado en la variante: " + firstVariant.sku
  };
}

/** Input para crear un producto completo con imágenes, colores y variantes. */
type CreateProductInput = {
  title: string;
  description: string;
  price: number;
  sizes: Size[];
  tags: string[];
  gender: Gender;
  categoryId: string;
  images: { url: string; publicId: string }[];
  colors: { color: string; label: string; hexCode: string }[];
  variants: { sku: string; size: Size; color: string; stock: number }[];
};

/**
 * Crea un producto completo: base + imágenes + colores + variantes + stock inicial.
 * Usa transacción Prisma para garantizar atomicidad.
 */
export async function createProductService(data: CreateProductInput) {
  const { images, colors, variants, ...productData } = data;

  // Generar SLUG dinámico (por ejemplo "Remera Gris" -> "remera-gris")
  const baseSlug = productData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // Calcular stock total sumando todas las variantes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalStock = variants?.reduce((sum, v) => sum + v.stock, 0) || 0;

  // Crear producto con colores y variantes en una transacción
  return prisma.$transaction(async (tx) => {
    // 1. Crear el producto base
    const product = await tx.product.create({
      data: {
        ...productData,
        slug: baseSlug,
        ProductImage: {
          create: images.map((img) => ({
            url: img.url,
            publicId: img.publicId,
          })),
        },
      },
    });

    // 2. Crear colores del producto
    const createdColors = [];
    for (const colorData of colors) {
      const color = await tx.productColor.create({
        data: {
          productId: product.id,
          color: colorData.color,
          label: colorData.label,
          hexCode: colorData.hexCode,
        },
      });
      createdColors.push(color);

      // Crear imágenes para el color (usar las mismas imágenes del producto)
      await tx.productColorImage.createMany({
        data: images.map((img, index) => ({
          productColorId: color.id,
          url: img.url,
          order: index,
        })),
      });
    }

    // 3. Crear variantes
    for (const variantData of variants) {
      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          sku: variantData.sku,
          size: variantData.size,
          color: variantData.color,
          stock: variantData.stock,
          isActive: true,
        },
      });

      // Crear movimiento de stock si es > 0
      if (variantData.stock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            variantId: variant.id,
            type: "restock",
            quantity: variantData.stock,
            note: "Stock inicial al crear producto",
          },
        });
      }
    }

    return product;
  });
}

/** Obtiene un producto por ID con imágenes y categoría. */
export async function getProductByIdService(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      ProductImage: true,
      category: true,
    },
  });
}

/**
 * Actualiza un producto: datos centrales + imágenes nuevas.
 * Las imágenes existentes se mantienen, solo se agregan las nuevas.
 */
export async function updateProductService(
  productId: string,
  data: {
    title: string;
    description: string;
    price: number;
    sizes: Size[];
    tags: string[];
    gender: Gender;
    categoryId: string;
    images: { url: string; publicId: string }[];
  },
) {
  const { images, ...productData } = data;

  // 1. Traer las imágenes que el producto YA tiene actualmente en DB
  const existingRecords = await prisma.productImage.findMany({
    where: { productId },
  });
  const existingPublicIds = existingRecords.map((img) => img.publicId);

  // 2. Filtrar para mandar a CREAR exclusivamente las nuevas
  // (Aquellas cuyo publicId no esté ya grabado en DB)
  const newImagesToCreate = images.filter(
    (img) => !existingPublicIds.includes(img.publicId),
  );

  // 3. Actualizar datos centrales y añadir sólo las fotos nuevas
  return prisma.product.update({
    where: { id: productId },
    data: {
      ...productData,
      ProductImage: {
        create: newImagesToCreate.map((img) => ({
          url: img.url,
          publicId: img.publicId,
        })),
      },
    },
    include: {
      ProductImage: true,
      category: true,
    },
  });
}

// ── Read Operations ──

import type { VariantsByColor } from "@/interfaces/product.interface";
import { Size as PrismaSize } from "@/generated/prisma/enums";

type ProductBySlugResult = {
  id: string;
  title: string;
  description: string;
  price: number;
  slug: string;
  sizes: PrismaSize[];
  tags: string[];
  gender: string;
  isActive: boolean;
  categoryId: string;
  images: string[];
  variantsByColor: VariantsByColor[];
};

/** Obtiene un producto por slug con variantes agrupadas por color. */
export async function getProductBySlugService(
  slug: string
): Promise<ProductBySlugResult | null> {
  const product = await prisma.product.findFirst({
    include: {
      ProductImage: { select: { url: true } },
      variants: {
        where: { isActive: true },
        orderBy: { size: "asc" },
      },
      colors: {
        include: {
          images: {
            orderBy: { order: "asc" },
            select: { url: true },
          },
        },
        orderBy: { label: "asc" },
      },
    },
    where: { slug, isActive: true },
  });

  if (!product) return null;

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
        size: v.size as unknown as import("@/interfaces/product.interface").Size,
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
}

/** Obtiene el stock total de un producto (suma de variantes activas). */
export async function getStockBySlugService(slug: string): Promise<number> {
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
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}

async function resolveColorInfo(
  productId: string,
  color: string
): Promise<{ colorLabel: string; colorHex: string }> {
  const productColor = await prisma.productColor.findUnique({
    where: {
      productId_color: { productId, color },
    },
  });

  if (productColor) {
    return {
      colorLabel: productColor.label,
      colorHex: productColor.hexCode ?? "#808080",
    };
  }

  return {
    colorLabel: color.replace(/_/g, " "),
    colorHex: "#808080",
  };
}

/** Obtiene la variante más disponible para quick add. */
export async function getVariantForQuickAddService(
  productId: string,
  size: Size
) {
  const variant = await prisma.productVariant.findFirst({
    where: {
      productId,
      size,
      isActive: true,
      stock: { gt: 0 },
    },
    orderBy: { stock: "desc" },
  });

  if (!variant) {
    const fallbackVariant = await prisma.productVariant.findFirst({
      where: { productId, size, isActive: true },
    });

    if (!fallbackVariant) return null;

    const colorInfo = await resolveColorInfo(productId, fallbackVariant.color);
    return {
      id: fallbackVariant.id,
      sku: fallbackVariant.sku,
      size: fallbackVariant.size,
      stock: fallbackVariant.stock,
      color: fallbackVariant.color,
      ...colorInfo,
    };
  }

  const colorInfo = await resolveColorInfo(productId, variant.color);
  return {
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    stock: variant.stock,
    color: variant.color,
    ...colorInfo,
  };
}

type PaginationOptions = {
  page?: number;
  take?: number;
  gender?: Gender;
};

/** Obtiene productos paginados con imágenes. */
export async function getPaginatedProductsService({
  page = 1,
  take = 12,
  gender,
}: PaginationOptions) {
  if (isNaN(Number(page))) page = 1;
  if (page < 1) page = 1;
  if (page > 1000) page = 1;

  if (isNaN(Number(take))) take = 12;
  if (take < 1) take = 1;
  if (take > 100) take = 100;

  const whereCondition = gender
    ? { gender, isActive: true as const }
    : { isActive: true as const };

  const totalProducts = await prisma.product.count({
    where: whereCondition,
  });

  const totalPages = Math.ceil(totalProducts / take);

  if (totalPages > 0 && page > totalPages) {
    page = totalPages;
  }

  const products = await prisma.product.findMany({
    where: whereCondition,
    take,
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
    totalPages,
    products: products.map(({ ProductImage, ...product }) => ({
      ...product,
      images: ProductImage.map((image: { url: string }) => image.url),
    })),
  };
}
