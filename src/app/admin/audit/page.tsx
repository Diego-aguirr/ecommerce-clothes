import { requireSuperAdmin } from "@/lib/admin/auth-utils";
import { getPaginatedAuditLogs } from "@/services/admin.service";
import { Pagination } from "@/components/admin/ui/pagination";

export const metadata = { title: "SuperAdmin | Auditoría" };

const PAGE_SIZE = 15;

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminAuditPage({ searchParams }: Props) {
  await requireSuperAdmin();

  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const { data: logs, total } = await getPaginatedAuditLogs(
    currentPage,
    PAGE_SIZE
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-700">Logs de Auditoría (SuperAdmin)</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Administrador</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entidad</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Target ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Metadata</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                  {log.adminName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-gray-900 text-white">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium text-xs">
                  {log.entity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-400 text-xs">
                  {log.targetId || "-"}
                </td>
                <td
                  className="px-6 py-4 text-xs font-mono text-gray-400 max-w-xs truncate overflow-hidden"
                  title={log.metadata ? JSON.stringify(log.metadata) : ""}
                >
                  {log.metadata ? JSON.stringify(log.metadata) : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">
            No hay registros de auditoría aún.
          </div>
        )}

        <div className="px-6 pb-4">
          <Pagination total={total} pageSize={PAGE_SIZE} currentPage={currentPage} />
        </div>
      </div>
    </div>
  );
}
