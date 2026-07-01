"use server";

import { requireAdmin } from "@/lib/admin/auth-utils";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { revalidatePath } from "next/cache";
import { Product, StockMovement } from "@/generated/prisma/client";
import { z } from "zod";
import { handleActionError } from "@/lib/errors";
import { ToggleProductStatusSchema, UpdateProductDetailsSchema, AdjustStockSchema } from "@/lib/validations";
import { CreateProductSchema } from "@/lib/validations/product.schema";
import {
  toggleProductStatusService,
  updateProductDetailsService,
  adjustProductStockService,
  createProductService,
  updateProductService,
} from "@/services/product.service";
import { deleteImageService } from "@/services/upload.service";

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
  } catch (error: unknown) {
    return handleActionError(error, "toggleProductStatus");
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
  } catch (error: unknown) {
    return handleActionError(error, "updateProductDetails");
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
    const { updatedVariant, movement, previousStock } = await adjustProductStockService(
      validId,
      validAdj,
      validType,
      validNote
    );

    await logAdminAction({
      adminId: admin.id,
      action: "ADJUST_STOCK",
      targetId: validId,
      metadata: { previousStock, variantSku: updatedVariant.sku, type: validType, note: validNote },
    });

    revalidatePath("/admin/products");
    return { ok: true, movement };
  } catch (error: unknown) {
    return handleActionError(error, "adjustStock");
  }
}

export async function createProduct(payload: unknown): Promise<ProductActionResponse> {
  const admin = await requireAdmin();

  const parsed = CreateProductSchema.safeParse(payload);
  if (!parsed.success)
    return { ok: false, error: "Datos del producto incompletos o inválidos", issues: parsed.error.issues };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { colors, variants, ...productData } = parsed.data as any;

    // Validar server-side (el schema ya no exige .min(1))
    if (!colors || colors.length === 0) return { ok: false, error: "Debes agregar al menos un color" };
    if (!variants || variants.length === 0) return { ok: false, error: "Debes agregar al menos una variante (selecciona tallas)" };

    const product = await createProductService({ ...productData, colors, variants });

    await logAdminAction({
      adminId: admin.id,
      action: "CREATE_PRODUCT",
      targetId: product.id,
      metadata: { title: product.title, price: product.price },
    });

    revalidatePath("/admin/products");
    return { ok: true, product };
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "P2002") {
      return { ok: false, error: "Ya existe un producto con el mismo título/slug." };
    }
    return handleActionError(error, "createProduct");
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { imagesToDelete, colors, variants, ...productData } = parsed.data as any;

  try {
    // Primero eliminar de Cloudinary las imágenes que el admin quitó
    if (imagesToDelete.length > 0) {
      await Promise.all(imagesToDelete.map((publicId: string) => deleteImageService(publicId)));
    }

    const product = await updateProductService(productId, productData);

    await logAdminAction({
      adminId: admin.id,
      action: "UPDATE_PRODUCT",
      targetId: productId,
      metadata: { title: product.title, imagesToDelete },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    return { ok: true, product };
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "P2002") {
      return { ok: false, error: "Ya existe un producto con el mismo título/slug." };
    }
    return handleActionError(error, "updateProduct");
  }
}
