import { requireAdmin } from "@/lib/admin/auth-utils";
import { getPaginatedOrdersAdmin } from "@/services/admin.service";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import { Pagination } from "@/components/admin/ui/pagination";
import { SearchInput } from "@/components/admin/ui/search-input";

export const metadata = { title: "Admin | Órdenes" };

const PAGE_SIZE = 15;

type Props = { searchParams: Promise<{ page?: string; q?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdmin();

  const { page, q } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const search = q?.trim() || undefined;

  const { data: orders, total } = await getPaginatedOrdersAdmin(
    currentPage,
    PAGE_SIZE,
    search
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h1>
        <div className="w-full sm:w-64">
          <SearchInput placeholder="Buscar por cliente, email o ID..." />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID / Fecha</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pago</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado Logístico</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
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
                  {(() => {
                    // Lógica para mostrar siempre la verdad financiera
                    if (order.isPaid) {
                      return (
                        <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-700">
                          Pagado
                        </span>
                      );
                    }

                    const lastPayment = order.payments[0];

                    if (!lastPayment) {
                      return (
                        <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                          Iniciada
                        </span>
                      );
                    }

                    if (lastPayment.status === "REJECTED") {
                      return (
                        <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-700">
                          Pago Rechazado
                        </span>
                      );
                    }

                    if (lastPayment.status === "PENDING" || lastPayment.status === "CREATED") {
                      return (
                        <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                          Aguardando Pago
                        </span>
                      );
                    }

                    return (
                      <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                        Abandonada / Cancelada
                      </span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1 items-start">
                    <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${order.deliveryStatus === "shipped" || order.deliveryStatus === "delivered" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                      {order.deliveryStatus}
                    </span>
                    <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold uppercase rounded-md ${order.shippingMethod === 'pickup' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                      {order.shippingMethod === 'pickup' ? '🏪 Retiro' : '🚚 Domicilio'}
                    </span>
                  </div>
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
