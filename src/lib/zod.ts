import { z } from "zod";

export const emailSchema = z.object({
  email: z.email({ error: "Email inválido" }),
});

export const registerSchema = z.object({
  email: z.email({ error: "Email inválido" }),
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
