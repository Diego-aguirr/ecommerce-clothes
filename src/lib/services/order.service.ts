import prisma from "@/lib/prisma";
import "server-only";
import { OrderStatus, DeliveryStatus } from "@/generated/prisma/client";

export async function updateOrderDeliveryStatusService(orderId: string, deliveryStatus: DeliveryStatus, trackingCode?: string) {
  const oldOrder = await prisma.order.findUnique({ where: { id: orderId } });
  if (!oldOrder) throw new Error("Order not found");

  type UpdateOrderData = {
    deliveryStatus: DeliveryStatus;
    shippedAt?: Date;
    trackingCode?: string;
  };

  const updateData: UpdateOrderData = { deliveryStatus };
  
  if (deliveryStatus === "shipped" && !oldOrder.shippedAt) {
    updateData.shippedAt = new Date();
  }
  
  if (trackingCode !== undefined) {
    updateData.trackingCode = trackingCode;
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
  });

  return { order, oldDeliveryStatus: oldOrder.deliveryStatus };
}

export async function updateOrderPaymentStatusService(orderId: string, status: OrderStatus) {
  const oldOrder = await prisma.order.findUnique({ where: { id: orderId } });
  if (!oldOrder) throw new Error("Order not found");

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });

  return { order, oldStatus: oldOrder.status };
}

export async function updateOrderNotesService(orderId: string, notes: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { notes }
  });
}
