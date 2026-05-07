import prisma from "@/lib/prisma";
import "server-only";
import { Size, Gender } from "@/generated/prisma/enums";

export async function toggleProductStatusService(
  productId: string,
  isActive: boolean,
) {
  return prisma.product.update({
    where: { id: productId },
    data: { isActive },
  });
}

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

export async function createProductService(data: any) {
  const { images, colors, variants, ...productData } = data;

  // Generar SLUG dinámico (por ejemplo "Remera Gris" -> "remera-gris")
  const baseSlug = productData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // Calcular stock total sumando todas las variantes
  const totalStock = variants?.reduce((sum: number, v: { stock: number }) => sum + v.stock, 0) || 0;

  // Crear producto con colores y variantes en una transacción
  return prisma.$transaction(async (tx) => {
    // 1. Crear el producto base
    const product = await tx.product.create({
      data: {
        ...productData,
        slug: baseSlug,
        ProductImage: {
          create: images.map((img: { url: string; publicId: string }) => ({
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
        data: images.map((img: { url: string }, index: number) => ({
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

export async function getProductByIdService(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      ProductImage: true,
      category: true,
    },
  });
}

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
