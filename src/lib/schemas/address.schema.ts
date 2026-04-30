import { z } from "zod";

export const setUserAddressSchema = z.object({
  id: z.string().optional(),
  shippingMethod: z.enum(["delivery", "pickup"]),
  fullname: z.string().min(1, "El nombre completo es obligatorio"),
  street: z.string().optional(),
  apartment: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().min(1, "El teléfono es obligatorio"),
  dni: z.string().min(1, "El DNI es obligatorio"),
  description: z.string().optional(),
  isDefault: z.boolean().default(false).optional(),
  provinceId: z.string().optional(),
  rememberAddress: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.shippingMethod === "delivery") {
    if (!data.street || data.street.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La calle es obligatoria para envíos a domicilio",
        path: ["street"],
      });
    }
    if (!data.zip || data.zip.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El código postal es obligatorio",
        path: ["zip"],
      });
    }
    if (!data.city || data.city.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La ciudad es obligatoria",
        path: ["city"],
      });
    }
    if (!data.provinceId || data.provinceId.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La provincia es obligatoria",
        path: ["provinceId"],
      });
    }
  }
});
