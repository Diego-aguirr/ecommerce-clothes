"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth-utils";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { revalidatePath } from "next/cache";
import { OrderStatus, DeliveryStatus } from "@/generated/prisma/client";
import { z } from "zod";

const DeliveryStatusSchema = z.enum(["pending", "shipped", "delivered"]);
const OrderStatusSchema = z.enum(["pending", "paid", "cancelled"]);

// Input schemas for validation
const UpdateDeliveryStatusInput = z.object({
  orderId: z.string().uuid({ message: "Invalid order ID" }),
  deliveryStatus: DeliveryStatusSchema,
  trackingCode: z.string().optional()
});

const UpdateOrderStatusInput = z.object({
  orderId: z.string().uuid({ message: "Invalid order ID" }),
  status: OrderStatusSchema,
});

const UpdateOrderNotesInput = z.object({
  orderId: z.string().uuid({ message: "Invalid order ID" }),
  notes: z.string()
});

export async function updateDeliveryStatus(orderId: string, deliveryStatus: DeliveryStatus, trackingCode?: string) {
  const admin = await requireAdmin();

  // Validate inputs
  const parsed = UpdateDeliveryStatusInput.safeParse({ orderId, deliveryStatus, trackingCode });
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  }
  const data = parsed.data;

  const oldOrder = await prisma.order.findUnique({ where: { id: data.orderId } });
  
  if (!oldOrder) {
    return { ok: false, error: "Order not found" };
  }

  const updateData: any = { deliveryStatus: data.deliveryStatus };
  
  if (data.deliveryStatus === "shipped" && !oldOrder.shippedAt) {
    updateData.shippedAt = new Date();
  }
  
  if (data.trackingCode !== undefined) {
    updateData.trackingCode = data.trackingCode;
  }

  const order = await prisma.order.update({
    where: { id: data.orderId },
    data: updateData,
  });

  await logAdminAction({
    adminId: admin.id,
    action: "UPDATE_DELIVERY_STATUS",
    targetId: data.orderId,
    metadata: {
      oldDeliveryStatus: oldOrder.deliveryStatus,
      newDeliveryStatus: data.deliveryStatus,
      trackingCode: data.trackingCode
    }
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${data.orderId}`);
  return { ok: true, order };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const admin = await requireAdmin();

  const parsed = UpdateOrderStatusInput.safeParse({ orderId, status });
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  }
  
  const data = parsed.data;
  const oldOrder = await prisma.order.findUnique({ where: { id: data.orderId } });
  if (!oldOrder) return { ok: false, error: "Order not found" };

  const order = await prisma.order.update({
    where: { id: data.orderId },
    data: { status: data.status }
  });

  await logAdminAction({
    adminId: admin.id,
    action: "UPDATE_ORDER_STATUS",
    targetId: data.orderId,
    metadata: {
      oldStatus: oldOrder.status,
      newStatus: data.status
    }
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${data.orderId}`);
  return { ok: true, order };
}

export async function updateOrderNotes(orderId: string, notes: string) {
  const admin = await requireAdmin();

  // Validate inputs
  const parsed = UpdateOrderNotesInput.safeParse({ orderId, notes });
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  }
  const data = parsed.data;

  const order = await prisma.order.update({
    where: { id: data.orderId },
    data: { notes: data.notes }
  });

  await logAdminAction({
    adminId: admin.id,
    action: "UPDATE_ORDER_NOTES",
    targetId: data.orderId,
    metadata: { notes: data.notes }
  });

  revalidatePath(`/admin/orders/${data.orderId}`);
  return { ok: true, order };
}
