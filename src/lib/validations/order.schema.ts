import { z } from "zod";

export const DeliveryStatusSchema = z.enum(["pending", "shipped", "delivered"]);
export const OrderStatusSchema = z.enum(["pending", "paid", "cancelled"]);

export const UpdateDeliveryStatusSchema = z.object({
  orderId: z.uuid({ error: "ID de orden inválido" }),
  deliveryStatus: DeliveryStatusSchema,
  trackingCode: z.string().optional()
});

export const UpdateOrderStatusSchema = z.object({
  orderId: z.uuid({ error: "ID de orden inválido" }),
  status: OrderStatusSchema,
});

export const UpdateOrderNotesSchema = z.object({
  orderId: z.uuid({ error: "ID de orden inválido" }),
  notes: z.string()
});
