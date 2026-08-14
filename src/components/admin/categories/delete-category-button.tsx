"use client";

import { useTransition } from "react";
import { deleteCategory } from "@/actions/admin";

export function DeleteCategoryButton({
  categoryId,
  count,
}: {
  categoryId: string;
  count: number;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (count > 0) return;

    startTransition(async () => {
      await deleteCategory(categoryId);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending || count > 0}
      className={`text-red-500 hover:text-red-700 transition-colors text-sm ${
        count > 0 ? "opacity-30 cursor-not-allowed" : ""
      }`}
      title={count > 0 ? "No puedes eliminar categorías en uso" : "Eliminar"}
    >
      Eliminar
    </button>
  );
}
