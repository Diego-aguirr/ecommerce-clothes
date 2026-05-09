import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(2, "El nombre de la categoría debe tener al menos 2 caracteres").max(50, "El nombre es muy largo"),
});

export const DeleteCategorySchema = z.object({
  categoryId: z.string().uuid("ID de categoría inválido"),
});
