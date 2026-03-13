import { z } from "zod";

export const setUserAddressSchema = z.object({
  id: z.string().optional(),
  fullname: z.string().min(1, "El nombre completo es obligatorio"),
  street: z.string().min(1, "La calle es obligatoria"),
  apartment: z.string().optional().nullable(),
  zip: z.string().min(1, "El código postal es obligatorio"),
  city: z.string().min(1, "La ciudad es obligatoria"),
  phone: z.string().min(1, "El teléfono es obligatorio"),
  dni: z.string().min(1, "El DNI es obligatorio"),
  description: z.string().optional().nullable(),
  isDefault: z.boolean().default(false).optional(),
  provinceId: z.string().min(1, "La provincia es obligatoria"),
});
