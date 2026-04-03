"use server";

import { requireAdmin } from "@/lib/admin/auth-utils";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { revalidatePath } from "next/cache";
import { Product, StockMovement } from "@/generated/prisma/client";
import { z } from "zod";
import { ToggleProductStatusSchema, UpdateProductDetailsSchema, AdjustStockSchema } from "@/lib/validations";
import { toggleProductStatusService, updateProductDetailsService, adjustProductStockService } from "@/lib/services/product.service";

export type ProductActionResponse = {
  ok: boolean;
  product?: Product;
  movement?: StockMovement;
  error?: string;
  issues?: z.ZodIssue[];
};

export async function toggleProductStatus(productId: string, isActive: boolean): Promise<ProductActionResponse> {
  const admin = await requireAdmin();

  const parsed = ToggleProductStatusSchema.safeParse({ productId, isActive });
  if (!parsed.success) return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  
  const { productId: validId, isActive: validIsActive } = parsed.data;

  try {
    const product = await toggleProductStatusService(validId, validIsActive);

    await logAdminAction({
      adminId: admin.id,
      action: "TOGGLE_PRODUCT_STATUS",
      targetId: validId,
      metadata: { isActive: validIsActive }
    });

    revalidatePath("/admin/products");
    return { ok: true, product };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

export async function updateProductDetails(
  productId: string, 
  data: { price?: number; title?: string }
): Promise<ProductActionResponse> {
  const admin = await requireAdmin();

  const parsed = UpdateProductDetailsSchema.safeParse({ productId, data });
  if (!parsed.success) return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  
  const { productId: validId, data: validData } = parsed.data;

  try {
    const { product, oldProduct } = await updateProductDetailsService(validId, validData);

    await logAdminAction({
      adminId: admin.id,
      action: "UPDATE_PRODUCT_DETAILS",
      targetId: validId,
      metadata: { 
        old: { price: oldProduct?.price, title: oldProduct?.title },
        new: validData 
      }
    });

    revalidatePath("/admin/products");
    return { ok: true, product };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

export async function adjustStock(productId: string, adjustment: number, type: string, note?: string): Promise<ProductActionResponse> {
  const admin = await requireAdmin();

  const parsed = AdjustStockSchema.safeParse({ productId, adjustment, type, note });
  if (!parsed.success) return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  
  const { productId: validId, adjustment: validAdj, type: validType, note: validNote } = parsed.data;

  try {
    const { updatedProduct, movement, previousStock } = await adjustProductStockService(validId, validAdj, validType, validNote);

    await logAdminAction({
      adminId: admin.id,
      action: "ADJUST_STOCK",
      targetId: validId,
      metadata: { previousStock, newStock: updatedProduct.inStock, type: validType, note: validNote }
    });

    revalidatePath("/admin/products");
    return { ok: true, product: updatedProduct, movement };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}
