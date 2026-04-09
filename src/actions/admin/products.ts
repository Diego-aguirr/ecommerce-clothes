"use server";

import { requireAdmin } from "@/lib/admin/auth-utils";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { revalidatePath } from "next/cache";
import { Product, StockMovement } from "@/generated/prisma/client";
import { z } from "zod";
import { ToggleProductStatusSchema, UpdateProductDetailsSchema, AdjustStockSchema } from "@/lib/validations";
import { CreateProductSchema } from "@/lib/validations/product.schema";
import {
  toggleProductStatusService,
  updateProductDetailsService,
  adjustProductStockService,
  createProductService,
  updateProductService,
} from "@/lib/services/product.service";
import { deleteImageService } from "@/lib/services/upload.service";

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
        new: validData,
      },
    });

    revalidatePath("/admin/products");
    return { ok: true, product };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

export async function adjustStock(
  productId: string,
  adjustment: number,
  type: string,
  note?: string
): Promise<ProductActionResponse> {
  const admin = await requireAdmin();

  const parsed = AdjustStockSchema.safeParse({ productId, adjustment, type, note });
  if (!parsed.success) return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };

  const { productId: validId, adjustment: validAdj, type: validType, note: validNote } = parsed.data;

  try {
    const { updatedProduct, movement, previousStock } = await adjustProductStockService(
      validId,
      validAdj,
      validType,
      validNote
    );

    await logAdminAction({
      adminId: admin.id,
      action: "ADJUST_STOCK",
      targetId: validId,
      metadata: { previousStock, newStock: updatedProduct.inStock, type: validType, note: validNote },
    });

    revalidatePath("/admin/products");
    return { ok: true, product: updatedProduct, movement };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

export async function createProduct(payload: unknown): Promise<ProductActionResponse> {
  const admin = await requireAdmin();

  const parsed = CreateProductSchema.safeParse(payload);
  if (!parsed.success)
    return { ok: false, error: "Datos del producto incompletos o inválidos", issues: parsed.error.issues };

  try {
    const product = await createProductService(parsed.data);

    await logAdminAction({
      adminId: admin.id,
      action: "CREATE_PRODUCT",
      targetId: product.id,
      metadata: { title: product.title, price: product.price, inStock: product.inStock },
    });

    revalidatePath("/admin/products");
    return { ok: true, product };
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error.code === "P2002") {
      return { ok: false, error: "Ya existe un producto con el mismo título/slug." };
    }
    return { ok: false, error: "Error al crear el producto en la base de datos." };
  }
}

const UpdateProductSchema = CreateProductSchema.extend({
  imagesToDelete: z.array(z.string()).default([]),
});

export async function updateProduct(productId: string, payload: unknown): Promise<ProductActionResponse> {
  const admin = await requireAdmin();

  if (!productId) return { ok: false, error: "ID de producto requerido" };

  const parsed = UpdateProductSchema.safeParse(payload);
  if (!parsed.success)
    return { ok: false, error: "Datos del producto incompletos o inválidos", issues: parsed.error.issues };

  const { imagesToDelete, ...productData } = parsed.data;

  try {
    // Primero eliminar de Cloudinary las imágenes que el admin quitó
    if (imagesToDelete.length > 0) {
      await Promise.all(imagesToDelete.map((publicId) => deleteImageService(publicId)));
    }

    const product = await updateProductService(productId, { ...productData, imagesToDelete });

    await logAdminAction({
      adminId: admin.id,
      action: "UPDATE_PRODUCT",
      targetId: productId,
      metadata: { title: product.title, imagesToDelete },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    return { ok: true, product };
  } catch (error: any) {
    console.error("Error updating product:", error);
    if (error.code === "P2002") {
      return { ok: false, error: "Ya existe un producto con el mismo título/slug." };
    }
    return { ok: false, error: "Error al actualizar el producto." };
  }
}
