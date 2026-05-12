import prisma from "@/lib/prisma";
import { z } from "zod";

// ── Schemas ──

const createColorSchema = z.object({
  productId: z.string().uuid(),
  color: z.string().min(1, "Nombre técnico del color es requerido"),
  label: z.string().min(1, "Nombre mostrado es requerido"),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Formato de color inválido (ej: #FF0000)").optional(),
});

const addImageSchema = z.object({
  productColorId: z.string().uuid(),
  url: z.string().url("URL inválida"),
  order: z.number().default(0),
});

export type CreateColorInput = z.infer<typeof createColorSchema>;
export type AddImageInput = z.infer<typeof addImageSchema>;

// ── Service ──

export async function getProductColors(productId: string) {
  const colors = await prisma.productColor.findMany({
    where: { productId },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: { images: true },
      },
    },
    orderBy: { label: "asc" },
  });

  return { ok: true, colors };
}

export async function createProductColor(input: CreateColorInput) {
  const validated = createColorSchema.parse(input);

  // Verificar que no exista un color con el mismo nombre técnico
  const existing = await prisma.productColor.findFirst({
    where: {
      productId: validated.productId,
      color: validated.color,
    },
  });

  if (existing) {
    return {
      ok: false,
      message: `Ya existe un color con el nombre '${validated.color}'`,
    };
  }

  const color = await prisma.productColor.create({
    data: validated,
  });

  return { ok: true, color };
}

export async function deleteProductColor(colorId: string) {
  // Verificar si hay variantes usando este color
  const variantsCount = await prisma.productVariant.count({
    where: { color: colorId },
  });

  if (variantsCount > 0) {
    return {
      ok: false,
      message: `No se puede eliminar: hay ${variantsCount} variantes usando este color`,
    };
  }

  await prisma.productColor.delete({
    where: { id: colorId },
  });

  return { ok: true };
}

export async function addColorImage(input: AddImageInput) {
  const validated = addImageSchema.parse(input);

  const image = await prisma.productColorImage.create({
    data: validated,
  });

  return { ok: true, image };
}

export async function deleteColorImage(imageId: string) {
  await prisma.productColorImage.delete({
    where: { id: imageId },
  });

  return { ok: true };
}

export async function getColorById(productColorId: string) {
  return prisma.productColor.findUnique({
    where: { id: productColorId },
  });
}

export async function reorderColorImages(
  imageOrders: { id: string; order: number }[]
) {
  await Promise.all(
    imageOrders.map((item) =>
      prisma.productColorImage.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  return { ok: true };
}
