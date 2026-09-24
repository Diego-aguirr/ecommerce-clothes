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
        <h1 className="text-2xl font-bold text-foreground">Gestión de Órdenes</h1>
        <div className="w-full sm:w-64">
          <SearchInput placeholder="Buscar por cliente, email o ID..." />
        </div>
      </div>

      <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID / Fecha</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pago</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado Logístico</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  <div className="font-medium text-xs font-mono text-muted-foreground">{order.id.split("-")[0]}...</div>
                  <div className="text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-foreground">{order.user?.name || "Sin nombre"}</div>
                  <div className="text-xs text-muted-foreground">{order.user?.email || "Sin email"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
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
                        <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-muted text-muted-foreground">
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
                      <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-muted text-muted-foreground">
                        Abandonada / Cancelada
                      </span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1 items-start">
                    <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${order.deliveryStatus === "shipped" || order.deliveryStatus === "delivered" ? "bg-indigo-100 text-indigo-700" : "bg-muted text-muted-foreground"}`}>
                      {order.deliveryStatus}
                    </span>
                    <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold uppercase rounded-md ${order.shippingMethod === 'pickup' ? 'bg-primary/5 text-primary border border-primary/20' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                      {order.shippingMethod === 'pickup' ? '🏪 Retiro' : '🚚 Domicilio'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-lg hover:bg-foreground transition"
                  >
                    <FiEye size={12} /> Detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm font-medium">
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
