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
  productId: z.uuid({ error: "ID de producto inválido" }),
  adjustment: z.number(),
  type: z.string().min(1, { error: "El tipo es obligatorio" }),
  note: z.string().optional(),
});
