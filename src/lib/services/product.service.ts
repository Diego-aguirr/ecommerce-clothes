import prisma from "@/lib/prisma";
import "server-only";
import { Size, Gender } from "@/generated/prisma/enums";

export async function toggleProductStatusService(productId: string, isActive: boolean) {
  return prisma.product.update({
    where: { id: productId },
    data: { isActive },
  });
}

export async function updateProductDetailsService(
  productId: string, 
  data: { price?: number; title?: string }
) {
  const oldProduct = await prisma.product.findUnique({ where: { id: productId } });
  
  const product = await prisma.product.update({
    where: { id: productId },
    data,
  });

  return { product, oldProduct };
}

export async function adjustProductStockService(productId: string, adjustment: number, type: string, note?: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Producto no encontrado");

  const newStock = product.inStock + adjustment;
  if (newStock < 0) throw new Error("El stock no puede ser negativo");

  const [updatedProduct, movement] = await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { inStock: newStock }
    }),
    prisma.stockMovement.create({
      data: {
        productId,
        type,
        quantity: adjustment,
        note
      }
    })
  ]);

  return { updatedProduct, movement, previousStock: product.inStock };
}

export async function createProductService(data: any) {
  const { images, ...productData } = data;
  
  // Generar SLUG dinámico (por ejemplo "Remera Gris" -> "remera-gris")
  const baseSlug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  // Para evitar colisiones seguras, en un entorno real podrías añadir sufijos aleatorios si falla
  return prisma.product.create({
    data: {
      ...productData,
      slug: baseSlug,
      ProductImage: {
        create: images.map((img: { url: string; publicId: string }) => ({ 
          url: img.url,
          publicId: img.publicId 
        })),
      }
    },
    include: {
      ProductImage: true,
      category: true,
    }
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
    inStock: number;
    price: number;
    sizes: Size[];
    tags: string[];
    gender: Gender;
    categoryId: string;
    images: { url: string; publicId: string }[];
    imagesToDelete: string[];
  }
) {
  const { images, imagesToDelete, ...productData } = data;

  // 1. Eliminar de DB las imágenes que el admin quitó en el formulario
  if (imagesToDelete.length > 0) {
    await prisma.productImage.deleteMany({
      where: { productId, publicId: { in: imagesToDelete } },
    });
  }

  // 2. Traer las imágenes que el producto YA tiene actualmente en DB
  const existingRecords = await prisma.productImage.findMany({
    where: { productId }
  });
  const existingPublicIds = existingRecords.map(img => img.publicId);

  // 3. Filtrar para mandar a CREAR exclusivamente las nuevas
  // (Aquellas cuyo publicId no esté ya grabado en DB)
  const newImagesToCreate = images.filter(
    (img) => !existingPublicIds.includes(img.publicId)
  );

  // 4. Actualizar datos centrales y añadir sólo las fotos nuevas
  return prisma.product.update({
    where: { id: productId },
    data: {
      ...productData,
      ProductImage: {
        create: newImagesToCreate.map((img) => ({ url: img.url, publicId: img.publicId })),
      },
    },
    include: {
      ProductImage: true,
      category: true,
    },
  });
}
