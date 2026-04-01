"use server";

import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin/auth-utils";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { revalidatePath } from "next/cache";
import { UserStatus, Role } from "@/generated/prisma/enums";
import { User } from "@/generated/prisma/client";
import { z } from "zod";
import { ToggleUserBlockSchema, UpdateUserRoleSchema } from "@/lib/validations";

export type UserActionResponse = {
  ok: boolean;
  user?: User;
  error?: string;
  issues?: z.ZodIssue[];
};

export async function toggleUserBlock(userId: string, isBlocked: boolean): Promise<UserActionResponse> {
  const admin = await requireSuperAdmin();

  const parsed = ToggleUserBlockSchema.safeParse({ userId, isBlocked });
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  }

  const { userId: validUserId, isBlocked: validIsBlocked } = parsed.data;
  const status = validIsBlocked ? UserStatus.BLOCKED : UserStatus.ACTIVE;

  const user = await prisma.user.update({
    where: { id: validUserId },
    data: { status },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "TOGGLE_USER_BLOCK",
    targetId: validUserId,
    metadata: { status },
  });

  revalidatePath("/admin/users");
  return { ok: true, user };
}

export async function updateUserRole(userId: string, role: Role): Promise<UserActionResponse> {
  const admin = await requireSuperAdmin();

  const parsed = UpdateUserRoleSchema.safeParse({ userId, role });
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos", issues: parsed.error.issues };
  }

  const { userId: validUserId, role: validRole } = parsed.data;

  const user = await prisma.user.update({
    where: { id: validUserId },
    data: { role: validRole },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "UPDATE_USER_ROLE",
    targetId: validUserId,
    metadata: { role: validRole },
  });

  revalidatePath("/admin/users");
  return { ok: true, user };
}
