"use server";

import { requireAdmin } from "@/lib/admin/auth-utils";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { revalidatePath } from "next/cache";
import { OrderStatus, DeliveryStatus, Order } from "@/generated/prisma/client";
import { z } from "zod";
import { UpdateDeliveryStatusSchema, UpdateOrderStatusSchema, UpdateOrderNotesSchema } from "@/lib/validations";
import { updateOrderDeliveryStatusService, updateOrderPaymentStatusService, updateOrderNotesService } from "@/lib/services/order.service";

export type OrderActionResponse = {
  ok: boolean;
  order?: Order;
  error?: string;
  issues?: z.ZodIssue[];
};

export async function updateDeliveryStatus(orderId: string, deliveryStatus: DeliveryStatus, trackingCode?: string): Promise<OrderActionResponse> {
  const admin = await requireAdmin();

  const parsed = UpdateDeliveryStatusSchema.safeParse({ orderId, deliveryStatus, trackingCode });
  if (!parsed.success) return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  
  const data = parsed.data;

  try {
    const { order, oldDeliveryStatus } = await updateOrderDeliveryStatusService(data.orderId, data.deliveryStatus, data.trackingCode);

    await logAdminAction({
      adminId: admin.id,
      action: "UPDATE_DELIVERY_STATUS",
      targetId: data.orderId,
      metadata: {
        oldDeliveryStatus,
        newDeliveryStatus: data.deliveryStatus,
        trackingCode: data.trackingCode
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${data.orderId}`);
    return { ok: true, order };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderActionResponse> {
  const admin = await requireAdmin();

  const parsed = UpdateOrderStatusSchema.safeParse({ orderId, status });
  if (!parsed.success) return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  
  const data = parsed.data;

  try {
    const { order, oldStatus } = await updateOrderPaymentStatusService(data.orderId, data.status);

    await logAdminAction({
      adminId: admin.id,
      action: "UPDATE_ORDER_STATUS",
      targetId: data.orderId,
      metadata: {
        oldStatus,
        newStatus: data.status
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${data.orderId}`);
    return { ok: true, order };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

export async function updateOrderNotes(orderId: string, notes: string): Promise<OrderActionResponse> {
  const admin = await requireAdmin();

  const parsed = UpdateOrderNotesSchema.safeParse({ orderId, notes });
  if (!parsed.success) return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  
  const data = parsed.data;

  try {
    const order = await updateOrderNotesService(data.orderId, data.notes);

    await logAdminAction({
      adminId: admin.id,
      action: "UPDATE_ORDER_NOTES",
      targetId: data.orderId,
      metadata: { notes: data.notes }
    });

    revalidatePath(`/admin/orders/${data.orderId}`);
    return { ok: true, order };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}
