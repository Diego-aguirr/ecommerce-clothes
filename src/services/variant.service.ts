import prisma from "@/lib/prisma";
import { z } from "zod";

// ── Schemas (vienen del action, se duplican para que el service no dependa del action) ──

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

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;

// ── Service ──

export async function getProductVariants(productId: string) {
  const variants = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: [{ color: "asc" }, { size: "asc" }],
  });
  return { ok: true, variants };
}

export async function createProductVariant(input: CreateVariantInput) {
  const validated = createVariantSchema.parse(input);

  // Verificar SKU único
  const existingSku = await prisma.productVariant.findUnique({
    where: { sku: validated.sku },
  });
  if (existingSku) {
    return { ok: false, message: "Ya existe una variante con ese SKU" };
  }

  // Verificar combinación color+talla duplicada
  const existingVariant = await prisma.productVariant.findFirst({
    where: {
      productId: validated.productId,
      color: validated.color,
      size: validated.size,
    },
  });
  if (existingVariant) {
    return {
      ok: false,
      message: `Ya existe una variante con color ${validated.color} y talla ${validated.size}`,
    };
  }

  // Crear
  const variant = await prisma.productVariant.create({
    data: validated,
  });

  // Stock movement inicial
  if (validated.stock > 0) {
    await prisma.stockMovement.create({
      data: {
        productId: validated.productId,
        variantId: variant.id,
        type: "restock",
        quantity: validated.stock,
        note: "Stock inicial al crear variante",
      },
    });
  }

  return { ok: true, variant };
}

export async function updateVariantStock(input: UpdateStockInput) {
  const validated = updateStockSchema.parse(input);

  const variant = await prisma.productVariant.findUnique({
    where: { id: validated.variantId },
  });
  if (!variant) {
    return { ok: false, message: "Variante no encontrada" };
  }

  const stockDiff = validated.stock - variant.stock;

  await prisma.productVariant.update({
    where: { id: validated.variantId },
    data: { stock: validated.stock },
  });

  await prisma.stockMovement.create({
    data: {
      productId: variant.productId,
      variantId: variant.id,
      type: stockDiff >= 0 ? "restock" : "adjustment",
      quantity: stockDiff,
      note: validated.note || "Ajuste manual de stock",
    },
  });

  return { ok: true };
}

export async function toggleVariantStatus(variantId: string, isActive: boolean) {
  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: { isActive },
  });
  return { ok: true, variant };
}
