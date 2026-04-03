import { requireSuperAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import { toggleUserBlock, updateUserRole } from "@/actions/admin/users";

export const metadata = { title: "SuperAdmin | Usuarios" };

export default async function AdminUsersPage() {
  await requireSuperAdmin();
  
  const users = await prisma.user.findMany({
    orderBy: [
      { createdAt: 'desc' },
      { id: 'asc' }
    ]
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-700">Gestión de Usuarios (SuperAdmin)</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones (Ban)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Promove</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role} {user.isSuperAdmin && "👑"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* @ts-expect-error React form action typings clash with our custom Return object */}
                  <form action={toggleUserBlock.bind(null, user.id, user.status !== 'BLOCKED')}>
                    <button type="submit" className={`focus:outline-none cursor-pointer ${user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}>
                      {user.status === 'ACTIVE' ? 'Bloquear' : 'Desbloquear'}
                    </button>
                  </form>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* @ts-expect-error React form action typings clash with our custom Return object */}
                  <form action={updateUserRole.bind(null, user.id, user.role === 'admin' ? 'user' : 'admin')}>
                    <button type="submit" className="text-indigo-600 hover:text-indigo-900 focus:outline-none cursor-pointer">
                      {user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
