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

const toggleVariantSchema = z.object({
  variantId: z.string().uuid(),
  isActive: z.boolean(),
});

// ── Actions (thin orchestrators) ──

export async function getProductVariants(productId: string) {
  await requireAdmin();
  try {
    const variants = await getProductVariantsService(productId);
    return { ok: true, variants };
  } catch (error) {
    return handleActionError(error, "getProductVariants");
  }
}

export async function createVariant(input: CreateVariantInput) {
  await requireAdmin();
  try {
    const variant = await createProductVariantService(input);
    revalidatePath(`/admin/products/${input.productId}/variants`);
    return { ok: true as const, variant };
  } catch (error) {
    return handleActionError(error, "createVariant");
  }
}

export async function updateVariantStock(input: UpdateStockInput) {
  await requireAdmin();
  try {
    const result = await updateVariantStockService(input);
    return { ok: true, ...result };
  } catch (error) {
    return handleActionError(error, "updateVariantStock");
  }
}

export async function toggleVariantStatus(input: { variantId: string; isActive: boolean }) {
  await requireAdmin();
  try {
    const validated = toggleVariantSchema.parse(input);
    const variant = await toggleVariantStatusService(validated.variantId, validated.isActive);
    revalidatePath(`/admin/products/${variant.productId}/variants`);
    return { ok: true, variant };
  } catch (error) {
    return handleActionError(error, "toggleVariantStatus");
  }
}

export async function bulkUpdateStock(
  updates: { variantId: string; stock: number; note?: string }[]
) {
  await requireAdmin();
  try {
    await Promise.all(updates.map((u) => updateVariantStockService(u)));
    return { ok: true, message: "Stock actualizado correctamente" };
  } catch (error) {
    return handleActionError(error, "bulkUpdateStock");
  }
}
