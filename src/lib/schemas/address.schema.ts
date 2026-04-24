import { z } from "zod";

export const setUserAddressSchema = z.object({
  id: z.string().optional(),
  fullname: z.string().min(1, "El nombre completo es obligatorio"),
  street: z.string().optional(),
  apartment: z.string().optional().nullable(),
  zip: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().min(1, "El teléfono es obligatorio"),
  dni: z.string().min(1, "El DNI es obligatorio"),
  description: z.string().optional().nullable(),
  isDefault: z.boolean().default(false).optional(),
  provinceId: z.string().optional(),
});
