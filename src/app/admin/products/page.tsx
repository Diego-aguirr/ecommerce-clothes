import { requireAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { toggleProductStatus } from "@/actions/admin/products";

export const metadata = { title: "Admin | Productos" };

export default async function AdminProductsPage() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: { title: "asc" },
    include: { category: true, ProductImage: { take: 1 } },
  });

  async function toggle(productId: string, nextActive: boolean): Promise<void> {
    "use server";
    await toggleProductStatus(productId, nextActive);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition"
        >
          ＋ Nuevo Producto
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.ProductImage[0] ? (
                      <img
                        src={p.ProductImage[0].url}
                        alt={p.title}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 shrink-0" />
                    )}
                    <span className="font-semibold text-gray-900 text-sm">{p.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {p.category.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.inStock} uds.</td>
                <td className="px-6 py-4 text-sm text-gray-500">${p.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4 text-sm font-semibold">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      Editar
                    </Link>
                    <form action={toggle.bind(null, p.id, !p.isActive)}>
                      <button
                        type="submit"
                        className={`cursor-pointer transition ${
                          p.isActive
                            ? "text-red-500 hover:text-red-700"
                            : "text-green-600 hover:text-green-800"
                        }`}
                      >
                        {p.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm font-medium">No hay productos registrados aún.</p>
            <Link
              href="/admin/products/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition"
            >
              ＋ Crear el primero
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
