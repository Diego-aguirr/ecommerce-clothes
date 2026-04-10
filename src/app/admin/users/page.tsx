import { requireSuperAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import { toggleUserBlock, updateUserRole } from "@/actions/admin/users";
import { Pagination } from "@/components/admin/ui/pagination";

export const metadata = { title: "SuperAdmin | Usuarios" };

const PAGE_SIZE = 15;

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminUsersPage({ searchParams }: Props) {
  await requireSuperAdmin();

  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: PAGE_SIZE,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    }),
    prisma.user.count(),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-700">Gestión de Usuarios (SuperAdmin)</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones (Ban)</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Promove</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-600"}`}>
                    {user.role} {user.isSuperAdmin && "👑"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* @ts-expect-error React form action typings clash with our custom Return object */}
                  <form action={toggleUserBlock.bind(null, user.id, user.status !== "BLOCKED")}>
                    <button
                      type="submit"
                      className={`cursor-pointer font-semibold transition px-3 py-1.5 rounded-lg text-xs ${user.status === "ACTIVE" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                    >
                      {user.status === "ACTIVE" ? "Bloquear" : "Desbloquear"}
                    </button>
                  </form>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* @ts-expect-error React form action typings clash with our custom Return object */}
                  <form action={updateUserRole.bind(null, user.id, user.role === "admin" ? "user" : "admin")}>
                    <button
                      type="submit"
                      className="cursor-pointer font-semibold transition px-3 py-1.5 rounded-lg text-xs bg-gray-900 text-white hover:bg-gray-700"
                    >
                      {user.role === "admin" ? "Quitar Admin" : "Hacer Admin"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">
            No hay usuarios registrados.
          </div>
        )}

        <div className="px-6 pb-4">
          <Pagination total={total} pageSize={PAGE_SIZE} currentPage={currentPage} />
        </div>
      </div>
    </div>
  );
}
