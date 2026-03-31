"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth-utils";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { revalidatePath } from "next/cache";

export async function toggleProductStatus(productId: string, isActive: boolean) {
  const admin = await requireAdmin();

  const product = await prisma.product.update({
    where: { id: productId },
    data: { isActive },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "TOGGLE_PRODUCT_STATUS",
    targetId: productId,
    metadata: { isActive }
  });

  revalidatePath("/admin/products");
  return { ok: true, product };
}

export async function updateProductDetails(
  productId: string, 
  data: { price?: number; title?: string }
) {
  const admin = await requireAdmin();

  const oldProduct = await prisma.product.findUnique({ where: { id: productId } });
  
  const product = await prisma.product.update({
    where: { id: productId },
    data,
  });

  await logAdminAction({
    adminId: admin.id,
    action: "UPDATE_PRODUCT_DETAILS",
    targetId: productId,
    metadata: { 
      old: { price: oldProduct?.price, title: oldProduct?.title },
      new: data 
    }
  });

  revalidatePath("/admin/products");
  return { ok: true, product };
}

export async function adjustStock(productId: string, adjustment: number, type: string, note?: string) {
  const admin = await requireAdmin();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Producto no encontrado");

  const newStock = product.inStock + adjustment;
  if (newStock < 0) throw new Error("El stock no puede ser negativo");

  // Utilizamos una transacción para asegurar la integridad
  const [updatedProduct, movement] = await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { inStock: newStock }
    }),
    prisma.stockMovement.create({
      data: {
        productId,
        type, // e.g., 'adjustment', 'restock'
        quantity: adjustment,
        note
      }
    })
  ]);

  await logAdminAction({
    adminId: admin.id,
    action: "ADJUST_STOCK",
    targetId: productId,
    metadata: { previousStock: product.inStock, newStock: updatedProduct.inStock, type, note }
  });

  revalidatePath("/admin/products");
  return { ok: true, product: updatedProduct, movement };
}
