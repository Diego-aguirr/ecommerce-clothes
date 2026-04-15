import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Email inválido" }),
  password: z
    .string()
    .min(1, { error: "Contraseña requerida" })
    .min(6, { error: "Mínimo 6 caracteres" })
    .max(32, { error: "Máximo 32 caracteres" }),
});

export const registerSchema = z.object({
  email: z.email({ error: "Email inválido" }),
  password: z
    .string()
    .min(1, { error: "Contraseña requerida" })
    .min(6, { error: "Mínimo 6 caracteres" })
    .max(32, { error: "Máximo 32 caracteres" }),
  name: z
    .string()
    .min(1, { error: "Nombre requerido" })
    .max(32, { error: "Máximo 32 caracteres" }),
});

// ---------------------------------------------------------------------------
// 📦 Mercado Pago Webhook Schema
// ---------------------------------------------------------------------------
export const webhookSchema = z.object({
  action: z.string(), // e.g., "payment.created", "payment.updated"
  data: z.object({
    id: z.string(), // payment id in Mercado Pago
  }),
  type: z.string(), // should be "payment"
});
