import { z } from "zod";

export const ToggleProductStatusSchema = z.object({
  productId: z.string().uuid({ message: "ID de producto inválido" }),
  isActive: z.boolean(),
});

export const UpdateProductDetailsSchema = z.object({
  productId: z.string().uuid({ message: "ID de producto inválido" }),
  data: z.object({
    price: z.number().min(0, { message: "El precio no puede ser negativo" }).optional(),
    title: z.string().min(1, { message: "El título es obligatorio" }).optional(),
  }),
});

export const AdjustStockSchema = z.object({
  productId: z.string().uuid({ message: "ID de producto inválido" }),
  adjustment: z.number(),
  type: z.string().min(1, { message: "El tipo es obligatorio" }),
  note: z.string().optional(),
});
