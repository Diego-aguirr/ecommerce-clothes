"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth-utils";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { revalidatePath } from "next/cache";
import { OrderStatus, DeliveryStatus, Order } from "@/generated/prisma/client";
import { z } from "zod";
import { UpdateDeliveryStatusSchema, UpdateOrderStatusSchema, UpdateOrderNotesSchema } from "@/lib/validations";

export type OrderActionResponse = {
  ok: boolean;
  order?: Order;
  error?: string;
  issues?: z.ZodIssue[];
};

export async function updateDeliveryStatus(orderId: string, deliveryStatus: DeliveryStatus, trackingCode?: string): Promise<OrderActionResponse> {
  const admin = await requireAdmin();

  // Validate inputs
  const parsed = UpdateDeliveryStatusSchema.safeParse({ orderId, deliveryStatus, trackingCode });
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  }
  const data = parsed.data;

  const oldOrder = await prisma.order.findUnique({ where: { id: data.orderId } });
  
  if (!oldOrder) {
    return { ok: false, error: "Order not found" };
  }

  type UpdateOrderData = {
    deliveryStatus: DeliveryStatus;
    shippedAt?: Date;
    trackingCode?: string;
  };

  const updateData: UpdateOrderData = { deliveryStatus: data.deliveryStatus };
  
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

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderActionResponse> {
  const admin = await requireAdmin();

  const parsed = UpdateOrderStatusSchema.safeParse({ orderId, status });
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

export async function updateOrderNotes(orderId: string, notes: string): Promise<OrderActionResponse> {
  const admin = await requireAdmin();

  // Validate inputs
  const parsed = UpdateOrderNotesSchema.safeParse({ orderId, notes });
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
