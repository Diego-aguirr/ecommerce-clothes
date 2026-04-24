import { z } from "zod";

export const orderSchema = z.object({
  productsToOrder: z.array(
    z.object({
      productId: z.string().uuid({ message: "ID de producto inválido" }),
      quantity: z.number().min(1, { message: "La cantidad debe ser al menos 1" }),
      size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL", "UNICO", "AJUSTABLE"]),
    })
  ).min(1, "Debe haber al menos un producto en la orden"),
  
  address: z.object({
    fullname: z.string().min(1, "El nombre completo es obligatorio"),
    street: z.string().optional(),
    apartment: z.string().optional().nullable(),
    zip: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().min(1, "El teléfono es obligatorio"),
    dni: z.string().min(1, "El DNI es obligatorio"),
    description: z.string().optional().nullable(),
    provinceId: z.string().optional(),
  }),

  shippingMethod: z.enum(["delivery", "pickup"]),

  idempotencyToken: z.string().uuid("Token de idempotencia inválido").optional(),
});
