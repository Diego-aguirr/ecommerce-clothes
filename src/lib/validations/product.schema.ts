import { z } from "zod";

export const ToggleProductStatusSchema = z.object({
  productId: z.uuid({ error: "ID de producto inválido" }),
  isActive: z.boolean(),
});

export const UpdateProductDetailsSchema = z.object({
  productId: z.uuid({ error: "ID de producto inválido" }),
  data: z.object({
    price: z.number().min(0, { error: "El precio no puede ser negativo" }).optional(),
    title: z.string().min(1, { error: "El título es obligatorio" }).optional(),
  }),
});

export const AdjustStockSchema = z.object({
  productId: z.string().uuid({ message: "ID de producto inválido" }),
  adjustment: z.number(),
  type: z.string().min(1, { message: "El tipo es obligatorio" }),
  note: z.string().optional(),
});

import { Size, Gender } from "@/generated/prisma/enums";

export const CreateProductSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  inStock: z.number().int().min(0, "El stock no puede ser negativo"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  sizes: z.array(z.nativeEnum(Size)).min(1, "Debes seleccionar al menos una talla"),
  tags: z.array(z.string()).default([]),
  gender: z.nativeEnum(Gender),
  categoryId: z.string().uuid("ID de categoría inválido"),
  images: z.array(
    z.object({
      url: z.string().url("Las imágenes deben ser URLs válidas"),
      publicId: z.string().min(1, "El publicId es requerido para gestionar imágenes")
    })
  ).default([]),
});
