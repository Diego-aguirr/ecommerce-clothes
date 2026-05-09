"use client";

import { useEffect, useState, useTransition } from "react";
import { getCategories, createCategory, deleteCategory } from "@/actions/admin";
import { Title } from "@/components/ui/title/Title";

type Category = {
  id: string;
  name: string;
  _count?: { Product: number };
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    const result = await getCategories();
    if (result.ok && result.categories) {
      setCategories(result.categories);
    }
    setIsLoading(false);
  };

  const handleCreate = () => {
    if (!newCategoryName.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await createCategory(newCategoryName.trim());
      if (result.ok) {
        setNewCategoryName("");
        loadCategories();
      } else {
        setError(result.error || "Error al crear la categoría");
      }
    });
  };

  const handleDelete = (id: string, count: number) => {
    if (count > 0) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.ok) {
        loadCategories();
      } else {
        setError(result.error || "Error al eliminar la categoría");
      }
    });
  };

  return (
    <>
      <Title title="Gestión de Categorías" />

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Creación */}
      <div className="bg-white p-6 rounded-lg border shadow-sm mb-6 flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Categoría
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Ej: Zapatillas"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            disabled={isPending}
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={isPending || !newCategoryName.trim()}
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Creando..." : "Crear"}
        </button>
      </div>

      {/* Listado */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Nombre</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Productos Activos</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No hay categorías creadas.
                </td>
              </tr>
            ) : (
              categories.map((category) => {
                const count = category._count?.Product || 0;
                return (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{category.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {count} producto{count !== 1 && "s"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={() => handleDelete(category.id, count)}
                        disabled={isPending || count > 0}
                        className={`text-red-500 hover:text-red-700 transition-colors ${
                          count > 0 ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                        title={count > 0 ? "No puedes eliminar categorías en uso" : "Eliminar"}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
