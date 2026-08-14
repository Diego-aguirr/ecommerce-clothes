/**
 * Admin Service
 *
 * Responsabilidad: Queries de solo lectura para el panel admin.
 * Usado por: admin pages (dashboard, products, orders, payments, audit).
 *
 * Reglas:
 * - Solo lectura (no mutaciones)
 * - Paginación centralizada
 * - "server-only" para evitar imports en client components
 */

import prisma from "@/lib/prisma";
import "server-only";

// ── Dashboard ──

export type DashboardStats = {
  todayOrders: number;
  pendingOrders: number;
  productsCount: number;
  totalRevenue: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOrders, pendingOrders, productsCount, revenueAggr] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { isPaid: true },
      }),
    ]);

  return {
    todayOrders,
    pendingOrders,
    productsCount,
    totalRevenue: revenueAggr._sum.total ?? 0,
  };
}

// ── Products (Admin) ──

export type AdminProduct = {
  id: string;
  title: string;
  price: number;
  isActive: boolean;
  category: { name: string };
  ProductImage: { url: string }[];
  _count: { variants: number };
};

type PaginatedResult<T> = {
  data: T[];
  total: number;
};

export async function getPaginatedProductsAdmin(
  page: number,
  pageSize: number,
  search?: string
): Promise<PaginatedResult<AdminProduct>> {
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { category: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: pageSize,
      orderBy: { title: "asc" },
      where,
      include: {
        category: true,
        ProductImage: { take: 1 },
        _count: { select: { variants: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { data, total };
}

// ── Orders (Admin) ──

export type AdminOrder = {
  id: string;
  createdAt: Date;
  total: number;
  isPaid: boolean;
  status: string;
  deliveryStatus: string;
  shippingMethod: string;
  user: { name: string | null; email: string } | null;
  payments: {
    status: string;
  }[];
};

export async function getPaginatedOrdersAdmin(
  page: number,
  pageSize: number,
  search?: string
): Promise<PaginatedResult<AdminOrder>> {
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { user: { name: { contains: search, mode: "insensitive" as const } } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
          { id: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      where,
      include: {
        user: { select: { name: true, email: true } },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total };
}

// ── Payments (Admin) ──

export type AdminPayment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerPaymentId: string | null;
  createdAt: Date;
  order: {
    id: string;
    user: {
      email: string;
    } | null;
  } | null;
};

export async function getPaginatedPaymentsAdmin(
  page: number,
  pageSize: number,
  search?: string
): Promise<PaginatedResult<AdminPayment>> {
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { providerPaymentId: { contains: search, mode: "insensitive" as const } },
          { order: { user: { email: { contains: search, mode: "insensitive" as const } } } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      where,
      include: {
        order: {
          select: {
            id: true,
            user: { select: { email: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return { data, total };
}

// ── Audit Logs (Admin) ──

export type AdminAuditLog = {
  id: string;
  action: string;
  entity: string;
  targetId: string | null;
  metadata: unknown;
  createdAt: Date;
  adminName: string;
};

export async function getPaginatedAuditLogs(
  page: number,
  pageSize: number
): Promise<PaginatedResult<AdminAuditLog>> {
  const skip = (page - 1) * pageSize;

  const [rawLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count(),
  ]);

  // Resolver nombres de admins en batch (sin N+1)
  const adminIds = [...new Set(rawLogs.map((l) => l.adminId))];
  const users = await prisma.user.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = users.reduce(
    (acc, u) => {
      acc[u.id] = u.name || u.email || u.id;
      return acc;
    },
    {} as Record<string, string>
  );

  const data = rawLogs.map((log) => ({
    ...log,
    adminName: userMap[log.adminId] || "Usuario Eliminado/Desconocido",
  }));

  return { data, total };
}

// ── Users (Admin) ──

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  status: string;
  createdAt: Date;
};

export async function getPaginatedUsersAdmin(
  page: number,
  pageSize: number,
  search?: string
): Promise<PaginatedResult<AdminUser>> {
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSuperAdmin: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total };
}
