"use server";

import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin/auth-utils";
import { logAdminAction } from "@/lib/admin/audit-logger";
import { revalidatePath } from "next/cache";
import { UserStatus, Role } from "@prisma/client";

export async function toggleUserBlock(userId: string, isBlocked: boolean) {
  const admin = await requireSuperAdmin();

  const status = isBlocked ? UserStatus.BLOCKED : UserStatus.ACTIVE;
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status }
  });

  await logAdminAction({
    adminId: admin.id,
    action: "TOGGLE_USER_BLOCK",
    targetId: userId,
    metadata: { status }
  });

  revalidatePath("/admin/users");
  return { ok: true, user };
}

export async function updateUserRole(userId: string, role: Role) {
  const admin = await requireSuperAdmin();

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role }
  });

  await logAdminAction({
    adminId: admin.id,
    action: "UPDATE_USER_ROLE",
    targetId: userId,
    metadata: { role }
  });

  revalidatePath("/admin/users");
  return { ok: true, user };
}
