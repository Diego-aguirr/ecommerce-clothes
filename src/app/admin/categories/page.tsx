import { requireAdmin } from "@/lib/admin/auth-utils";
import { getCategoriesService } from "@/services/category.service";
import { CreateCategoryForm } from "@/components/admin/categories/create-category-form";
import { DeleteCategoryButton } from "@/components/admin/categories/delete-category-button";

export const metadata = { title: "Admin | Categorías" };

export default async function CategoriesPage() {
  await requireAdmin();

  const categories = await getCategoriesService();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
      </div>

      <CreateCategoryForm />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">
                  No hay categorías creadas.
                </td>
              </tr>
            ) : (
              categories.map((category) => {
                const count = category._count?.Product || 0;
                return (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {count} producto{count !== 1 && "s"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <DeleteCategoryButton categoryId={category.id} count={count} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
