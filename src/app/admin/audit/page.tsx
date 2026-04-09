import { requireSuperAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";

export const metadata = { title: "SuperAdmin | Auditoría" };

export default async function AdminAuditPage() {
  await requireSuperAdmin();
  
  const rawLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100 // Límite de las últimas 100 por rendimiento
  });

  // Extraer los IDs únicos de los administradores que causaron las acciones
  const adminIds = [...new Set(rawLogs.map(l => l.adminId))];

  // Traer los nombres/emails de esos usuarios para mostrarlos bonito
  const users = await prisma.user.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, name: true, email: true },
  });

  // Crear un diccionario ID -> Nombre
  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user.name || user.email || user.id;
    return acc;
  }, {} as Record<string, string>);

  // Combinar los logs con el nombre resuelto
  const logs = rawLogs.map(log => ({
    ...log,
    adminName: userMap[log.adminId] || "Usuario Eliminado/Desconocido",
  }));

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
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Administrador</th>
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
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 border-l-[3px] border-transparent hover:border-blue-500 transition-colors">
                  {log.adminName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                  {log.entity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-400 text-xs">
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
