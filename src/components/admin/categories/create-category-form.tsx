"use client";

import { useState, useTransition } from "react";
import { createCategory } from "@/actions/admin";

export function CreateCategoryForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!name.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await createCategory(name.trim());
      if (result.ok) {
        setName("");
      } else {
        setError(result.error || "Error al crear la categoría");
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 border border-red-200 text-sm">
          {error}
        </div>
      )}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Categoría
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Ej: Zapatillas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={isPending}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isPending || !name.trim()}
          className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
        >
          {isPending ? "Creando..." : "Crear"}
        </button>
      </div>
    </div>
  );
}
