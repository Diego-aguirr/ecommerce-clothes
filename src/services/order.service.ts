/**
 * Order Service
 *
 * Responsabilidad: Crear órdenes y gestionar su estado (pago, delivery, notas).
 * Usado por: place-order action, admin/orders actions, webhook MercadoPago.
 *
 * Reglas:
 * - createOrder() lanza errores — la action es responsable del catch
 * - Usar transacciones Prisma para crear orden + items + address + payment
 * - Validar stock antes de crear la orden
 * - Calcular IVA con tasa fija (21%)
 * - IdempotencyToken para prevenir órdenes duplicadas
 * - Usar "server-only" para evitar imports en client components
 */

import prisma from "@/lib/prisma";
import "server-only";
import { OrderStatus, DeliveryStatus, Size } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { provinces } from "@/seed/seed-province";

// ── Types ──

type OrderProductInput = {
  productId: string;
  variantId: string;
  quantity: number;
  size: string;
  color: string;
};

type OrderAddressInput = {
  fullname: string;
  street?: string;
  apartment?: string | null;
  zip?: string;
  city?: string;
  phone: string;
  dni: string;
  description?: string | null;
  provinceId?: string;
};

export type CreateOrderInput = {
  userId: string;
  productsToOrder: OrderProductInput[];
  address: OrderAddressInput;
  shippingMethod: "delivery" | "pickup";
  idempotencyToken?: string;
  paymentProvider?: "mercadopago" | "cash";
};

// ── Business Logic ──

const IVA_RATE = 0.21;

/**
 * Asegura que la tabla de provincias tenga datos y valida que la provincia exista.
 */
async function ensureProvinceValid(provinceId: string) {
  let provinceCount = await prisma.province.count();

  if (provinceCount === 0) {
    await prisma.province.createMany({ data: provinces, skipDuplicates: true });
    provinceCount = await prisma.province.count();
  }

  const provinceExists = await prisma.province.findUnique({
    where: { id: provinceId },
  });

  if (!provinceExists) {
    throw new Error(
      "La provincia seleccionada no es válida. Por favor, actualizá tu dirección de envío."
    );
  }
}

/**
 * Obtiene productos y variantes, valida que existan y que haya stock suficiente.
 */
async function fetchAndValidateItems(productsToOrder: OrderProductInput[]) {
  // Obtener productos reales
  const products = await prisma.product.findMany({
    where: { id: { in: productsToOrder.map((p) => p.productId) } },
  });

  const uniqueProductIds = [...new Set(productsToOrder.map((p) => p.productId))];
  if (products.length !== uniqueProductIds.length) {
    throw new Error("Algunos productos no fueron encontrados");
  }

  // Obtener variantes
  const variantIds = productsToOrder
    .map((p) => p.variantId)
    .filter(Boolean) as string[];

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
  });

  if (variants.length !== variantIds.length) {
    throw new Error("Algunas variantes de producto no fueron encontradas");
  }

  // Validar stock por variante
  for (const item of productsToOrder) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) {
      throw new Error("Variante no encontrada para uno de los productos");
    }
    if (variant.stock < item.quantity) {
      const product = products.find((p) => p.id === item.productId)!;
      throw new Error(
        `Stock insuficiente para ${product.title} - ${variant.color} - Talle ${variant.size}`
      );
    }
  }

  return { products, variants };
}

/**
 * Calcula totales con IVA.
 */
function calculateTotals(
  productsToOrder: OrderProductInput[],
  products: { id: string; price: number }[]
) {
  const itemsInOrder = productsToOrder.reduce(
    (count, p) => count + p.quantity,
    0
  );

  const totalBruto = productsToOrder.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    if (
      typeof product.price !== "number" ||
      isNaN(product.price) ||
      isNaN(item.quantity)
    ) {
      throw new Error(
        "Manipulación detectada: Precio o cantidad de producto inválida"
      );
    }
    return total + product.price * item.quantity;
  }, 0);

  const tax = totalBruto - totalBruto / (1 + IVA_RATE);
  const subTotal = totalBruto - tax;
  const shipping = 0;
  const total = totalBruto;

  return { itemsInOrder, subTotal, tax, shipping, total };
}

/**
 * Crea la orden con su pago asociado dentro de una transacción.
 */
async function createOrderTransaction(
  input: CreateOrderInput,
  products: { id: string; price: number; title: string; description: string }[],
  variants: { id: string; color: string; size: string }[],
  totals: { itemsInOrder: number; subTotal: number; tax: number; shipping: number; total: number }
) {
  return prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId: input.userId,
        itemsInOrder: totals.itemsInOrder,
        subTotal: totals.subTotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        status: "pending",
        idempotencyToken: input.idempotencyToken,

        OrderItem: {
          createMany: {
            data: input.productsToOrder.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;
              const variant = variants.find((v) => v.id === item.variantId)!;

              return {
                productId: item.productId,
                quantity: item.quantity,
                size: item.size as Size,
                price: product.price,
                productName: product.title,
                productDescription: product.description,
                variantId: item.variantId,
                color: item.color || variant.color,
              };
            }),
          },
        },

        OrderAddress: {
          create: {
            fullname: input.address.fullname,
            street: input.address.street?.trim() || null,
            apartment: input.address.apartment?.trim() || null,
            zip: input.address.zip?.trim() || null,
            city: input.address.city?.trim() || null,
            phone: input.address.phone,
            dni: input.address.dni,
            description: input.address.description?.trim() || null,
            provinceId: input.address.provinceId?.trim() || null,
          },
        },
      },
    });

    const payment = await tx.payment.create({
      data: {
        orderId: newOrder.id,
        amount: totals.total,
        currency: "ARS",
        status: "CREATED",
        provider: input.paymentProvider || "mercadopago",
      },
    });

    return { newOrder, payment };
  });
}

// ── Public Service ──

/**
 * Orquesta la creación de una orden: validación, stock, IVA y transacción.
 * Lanza errores en caso de fallo — la action es responsable del catch.
 */
export async function createOrder(input: CreateOrderInput) {
  // 1. Validar provincia si es delivery
  if (input.shippingMethod === "delivery" && input.address.provinceId) {
    await ensureProvinceValid(input.address.provinceId);
  }

  // 2. Obtener y validar productos/variantes/stock
  const { products, variants } = await fetchAndValidateItems(
    input.productsToOrder
  );

  // 3. Calcular totales
  const totals = calculateTotals(input.productsToOrder, products);

  // 4. Crear orden + pago en transacción
  const result = await createOrderTransaction(
    input,
    products,
    variants,
    totals
  );

  return {
    order: {
      id: result.newOrder.id,
      total: result.newOrder.total,
      status: result.newOrder.status,
    },
    payment: {
      id: result.payment.id,
      status: result.payment.status,
    },
  };
}

// ── Existing services (unchanged) ──

export async function updateOrderDeliveryStatusService(
  orderId: string,
  deliveryStatus: DeliveryStatus,
  trackingCode?: string
) {
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

export async function updateOrderPaymentStatusService(
  orderId: string,
  status: OrderStatus
) {
  const oldOrder = await prisma.order.findUnique({ where: { id: orderId } });
  if (!oldOrder) throw new Error("Order not found");

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  return { order, oldStatus: oldOrder.status };
}

export async function updateOrderNotesService(orderId: string, notes: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { notes },
  });
}

// ── Payment Confirmation (shared between webhook and admin) ──

/**
 * Confirma el pago de una orden y decrementa el stock.
 * Usado por: webhook de MP y aprobación manual de admin.
 * Es idempotente: si la orden ya está pagada, no hace nada.
 */
export async function confirmPaymentAndUpdateStock(
  tx: Prisma.TransactionClient,
  orderId: string,
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { OrderItem: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.isPaid) return order; // idempotencia

  // decremento atómico seguro usando variantes
  for (const item of order.OrderItem) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (!variant || variant.stock < item.quantity) {
        throw new Error(`Stock insuficiente para la variante ${item.variantId}`);
      }

      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          variantId: item.variantId,
          quantity: -item.quantity,
          type: "sale",
          note: `Venta por Orden ${orderId}`,
        },
      });
    }
  }

  return await tx.order.update({
    where: { id: orderId },
    data: {
      isPaid: true,
      paidAt: new Date(),
      status: "paid",
    },
  });
}

/**
 * Aprueba un pago manual (cash/transferencia) y confirma la orden.
 * Lanza error si no es cash o ya está pagada.
 */
export async function approveCashPaymentService(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { orderId, provider: "cash" },
      include: { order: true },
    });

    if (!payment) throw new Error("No se encontró un pago en efectivo para esta orden");
    if (payment.status === "APPROVED" || payment.order.isPaid) {
      throw new Error("Esta orden ya está pagada");
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "APPROVED" },
    });

    return await confirmPaymentAndUpdateStock(tx, orderId);
  });
}

// ── Read Operations ──

/** Obtiene una orden por ID con dirección, items y producto. */
export async function getOrderByIdService(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      subTotal: true,
      tax: true,
      shipping: true,
      total: true,
      itemsInOrder: true,
      shippingMethod: true,
      isPaid: true,
      paidAt: true,
      status: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      OrderAddress: {
        select: {
          fullname: true,
          street: true,
          apartment: true,
          zip: true,
          city: true,
          phone: true,
          dni: true,
          description: true,
          province: {
            select: { name: true },
          },
        },
      },
      OrderItem: {
        select: {
          price: true,
          quantity: true,
          size: true,
          color: true,
          product: {
            select: {
              title: true,
              slug: true,
              ProductImage: {
                select: { url: true },
                orderBy: { id: "asc" },
                take: 1,
              },
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          provider: true,
          status: true,
          amount: true,
        },
      },
    },
  });
}

type PaginationInput = {
  page?: number;
  take?: number;
};

/** Obtiene órdenes paginadas de un usuario. */
export async function getOrdersByUserService(
  userId: string,
  { page = 1, take = 10 }: PaginationInput = {}
) {
  const safePage = Math.max(1, page);
  const safeTake = Math.max(1, Math.min(take, 50));
  const skip = (safePage - 1) * safeTake;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        total: true,
        isPaid: true,
        createdAt: true,
        status: true,
        OrderAddress: {
          select: { fullname: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeTake,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders,
    total,
    totalPages: Math.ceil(total / safeTake),
    currentPage: safePage,
  };
}

/** Obtiene todas las órdenes (admin). */
export async function getPaginatedOrdersService() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      OrderAddress: {
        select: { fullname: true },
      },
    },
  });
}
