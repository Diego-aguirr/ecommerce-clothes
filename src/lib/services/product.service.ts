import prisma from "@/lib/prisma";
import "server-only";

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
