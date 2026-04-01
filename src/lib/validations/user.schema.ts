import { z } from "zod";
import { Role } from "@/generated/prisma/enums";

export const ToggleUserBlockSchema = z.object({
  userId: z.string().uuid({ message: "ID de usuario inválido" }),
  isBlocked: z.boolean(),
});

export const UpdateUserRoleSchema = z.object({
  userId: z.string().uuid({ message: "ID de usuario inválido" }),
  role: z.nativeEnum(Role, { message: "Rol inválido" }),
});
