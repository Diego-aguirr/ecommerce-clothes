import { z } from "zod";
import { Role } from "@/generated/prisma/enums";

export const ToggleUserBlockSchema = z.object({
  userId: z.string().min(1, { error: "ID de usuario inválido" }),
  isBlocked: z.boolean(),
});

export const UpdateUserRoleSchema = z.object({
  userId: z.string().min(1, { error: "ID de usuario inválido" }),
  role: z.nativeEnum(Role, { error: "Rol inválido" }),
});
