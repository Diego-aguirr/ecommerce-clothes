import { requireAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import { Pagination } from "@/components/admin/ui/pagination";

export const metadata = { title: "Admin | Órdenes" };

const PAGE_SIZE = 15;

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdmin();

  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.order.count(),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID / Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pago</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado Logístico</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium text-xs font-mono text-gray-400">{order.id.split("-")[0]}...</div>
                  <div className="text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{order.user?.name || "Sin nombre"}</div>
                  <div className="text-xs text-gray-500">{order.user?.email || "Sin email"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${order.isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {order.isPaid ? "Pagado" : "Pendiente"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${order.deliveryStatus === "shipped" || order.deliveryStatus === "delivered" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                    {order.deliveryStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition"
                  >
                    <FiEye size={12} /> Detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">
            No hay órdenes registradas aún.
          </div>
        )}

        <div className="px-6 pb-4">
          <Pagination total={total} pageSize={PAGE_SIZE} currentPage={currentPage} />
        </div>
      </div>
    </div>
  );
}
