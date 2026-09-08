import { requireSuperAdmin } from "@/lib/admin/auth-utils";
import { getPaginatedPaymentsAdmin } from "@/services/admin.service";
import { Pagination } from "@/components/admin/ui/pagination";
import { SearchInput } from "@/components/admin/ui/search-input";

export const metadata = { title: "SuperAdmin | Pagos Registrados" };

const PAGE_SIZE = 15;

type Props = { searchParams: Promise<{ page?: string; q?: string }> };

export default async function AdminPaymentsPage({ searchParams }: Props) {
  await requireSuperAdmin();

  const { page, q } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const search = q?.trim() || undefined;

  const { data: payments, total } = await getPaginatedPaymentsAdmin(
    currentPage,
    PAGE_SIZE,
    search
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-red-700">Pagos en el Sistema (SuperAdmin)</h1>
        <div className="w-full sm:w-64">
          <SearchInput placeholder="Buscar por proveedor, ID o email..." />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor / ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Orden Vinculada</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                  {new Date(payment.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="block font-semibold text-gray-900 capitalize">{payment.provider}</span>
                  <span className="block text-xs font-mono text-gray-400">{payment.providerPaymentId || "Sin ID"}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                  ${payment.amount.toFixed(2)} {payment.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${payment.status === "APPROVED" ? "bg-green-100 text-green-700" : payment.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="block font-mono text-xs text-indigo-600">{payment.order?.id?.split("-")[0]}...</span>
                  <span className="block text-xs text-gray-500">{payment.order?.user?.email}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">
            No hay pagos registrados.
          </div>
        )}

        <div className="px-6 pb-4">
          <Pagination total={total} pageSize={PAGE_SIZE} currentPage={currentPage} />
        </div>
      </div>
    </div>
  );
}
