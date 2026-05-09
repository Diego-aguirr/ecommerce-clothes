"use server";

import { requireSuperAdmin } from "@/lib/admin/auth-utils";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { revalidatePath } from "next/cache";
import { UserStatus, Role } from "@/generated/prisma/enums";
import { User } from "@/generated/prisma/client";
import { z } from "zod";
import { ToggleUserBlockSchema, UpdateUserRoleSchema } from "@/lib/validations";
import { toggleUserBlockService, updateUserRoleService } from "@/lib/services/user.service";

export type UserActionResponse = {
  ok: boolean;
  user?: User;
  error?: string;
  issues?: z.ZodIssue[];
};

export async function toggleUserBlock(userId: string, isBlocked: boolean): Promise<UserActionResponse> {
  const admin = await requireSuperAdmin();

  const parsed = ToggleUserBlockSchema.safeParse({ userId, isBlocked });
  if (!parsed.success) return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  
  const { userId: validUserId, isBlocked: validIsBlocked } = parsed.data;

  // Security layer: Prevent self-destruction
  if (validUserId === admin.id) {
    return { ok: false, error: "Crítico: No puedes bloquear ni alterar tu propio usuario." };
  }

  try {
    const user = await toggleUserBlockService(validUserId, validIsBlocked);

    await logAdminAction({
      adminId: admin.id,
      action: "TOGGLE_USER_BLOCK",
      targetId: validUserId,
      metadata: { status: user.status },
    });

    revalidatePath("/admin/users");
    return { ok: true, user };
  } catch (error: unknown) {
    return { ok: false, error: (error instanceof Error ? error.message : "Error") };
  }
}

export async function updateUserRole(userId: string, role: Role): Promise<UserActionResponse> {
  const admin = await requireSuperAdmin();

  const parsed = UpdateUserRoleSchema.safeParse({ userId, role });
  if (!parsed.success) return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  
  const { userId: validUserId, role: validRole } = parsed.data;

  // Security layer: Prevent self-destruction
  if (validUserId === admin.id) {
    return { ok: false, error: "Crítico: No puedes cambiar tu propio rol de administrador." };
  }

  try {
    const user = await updateUserRoleService(validUserId, validRole);

    await logAdminAction({
      adminId: admin.id,
      action: "UPDATE_USER_ROLE",
      targetId: validUserId,
      metadata: { role: validRole },
    });

    revalidatePath("/admin/users");
    return { ok: true, user };
  } catch (error: unknown) {
    return { ok: false, error: (error instanceof Error ? error.message : "Error") };
  }
}
