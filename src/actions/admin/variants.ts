"use server";

import { requireAdmin } from "@/lib/admin/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { handleActionError } from "@/lib/errors";
import {
  getProductVariants as getProductVariantsService,
  createProductVariant as createProductVariantService,
  updateVariantStock as updateVariantStockService,
  toggleVariantStatus as toggleVariantStatusService,
  type CreateVariantInput,
  type UpdateStockInput,
} from "@/services/variant.service";

// ── Schemas (contrato de entrada del action) ──

const createVariantSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1, "SKU es requerido"),
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL", "UNICO", "AJUSTABLE"]),
  color: z.string().min(1, "Color es requerido"),
  stock: z.number().min(0).default(0),
});

const updateStockSchema = z.object({
  variantId: z.string().uuid(),
  stock: z.number().min(0),
  note: z.string().optional(),
});

const toggleVariantSchema = z.object({
  variantId: z.string().uuid(),
  isActive: z.boolean(),
});

// ── Actions (thin orchestrators) ──

export async function getProductVariants(productId: string) {
  await requireAdmin();
  try {
    return await getProductVariantsService(productId);
  } catch (error) {
    return handleActionError(error, "getProductVariants");
  }
}

export async function createVariant(input: CreateVariantInput) {
  await requireAdmin();
  try {
    const result = await createProductVariantService(input);
    if (result.ok) revalidatePath(`/admin/products/${input.productId}/variants`);
    return result;
  } catch (error) {
    return handleActionError(error, "createVariant");
  }
}

export async function updateVariantStock(input: UpdateStockInput) {
  await requireAdmin();
  try {
    const result = await updateVariantStockService(input);
    // El service no devuelve productId, revalidate genérico
    return result;
  } catch (error) {
    return handleActionError(error, "updateVariantStock");
  }
}

export async function toggleVariantStatus(input: { variantId: string; isActive: boolean }) {
  await requireAdmin();
  try {
    const validated = toggleVariantSchema.parse(input);
    const result = await toggleVariantStatusService(validated.variantId, validated.isActive);
    if (result.ok && result.variant) {
      revalidatePath(`/admin/products/${result.variant.productId}/variants`);
    }
    return result;
  } catch (error) {
    return handleActionError(error, "toggleVariantStatus");
  }
}

export async function bulkUpdateStock(
  updates: { variantId: string; stock: number; note?: string }[]
) {
  await requireAdmin();
  try {
    const results = await Promise.all(updates.map((u) => updateVariantStockService(u)));
    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      return { ok: false, message: `${failed.length} actualizaciones fallaron` };
    }
    return { ok: true, message: "Stock actualizado correctamente" };
  } catch (error) {
    return handleActionError(error, "bulkUpdateStock");
  }
}
