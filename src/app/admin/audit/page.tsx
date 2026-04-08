import { requireSuperAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";

export const metadata = { title: "SuperAdmin | Auditoría" };

export default async function AdminAuditPage() {
  await requireSuperAdmin();
  
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100 // Límite de las últimas 100 por rendimiento
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-700">Logs de Auditoría Registrados (SuperAdmin)</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Admin ID</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Entidad</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Target ID</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Metadata</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-800">
                  {log.adminId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                  {log.entity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-500">
                  {log.targetId || '-'}
                </td>
                <td className="px-6 py-4 text-xs font-mono text-gray-500 max-w-xs truncate overflow-hidden" title={log.metadata ? JSON.stringify(log.metadata) : ""}>
                   {log.metadata ? JSON.stringify(log.metadata) : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No hay registros de auditoría aún.
          </div>
        )}
      </div>
    </div>
  );
}
