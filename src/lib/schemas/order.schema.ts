import { z } from "zod";

export const orderSchema = z.object({
  productsToOrder: z.array(
    z.object({
      productId: z.string().uuid("ID de producto inválido"),
      quantity: z.number().min(1, "La cantidad debe ser al menos 1"),
      size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Único", "Ajustable"]),
    })
  ).min(1, "Debe haber al menos un producto en la orden"),
  
  address: z.object({
    fullname: z.string().min(1, "El nombre completo es obligatorio"),
    street: z.string().min(1, "La calle es obligatoria"),
    apartment: z.string().optional().nullable(),
    zip: z.string().min(1, "El código postal es obligatorio"),
    city: z.string().min(1, "La ciudad es obligatoria"),
    phone: z.string().min(1, "El teléfono es obligatorio"),
    dni: z.string().min(1, "El DNI es obligatorio"),
    description: z.string().optional().nullable(),
    provinceId: z.string().min(1, "La provincia es obligatoria"),
  })
});
