import prisma from "@/lib/prisma";
import "server-only";
import { UserStatus, Role } from "@/generated/prisma/enums";

export async function toggleUserBlockService(userId: string, isBlocked: boolean) {
  const status = isBlocked ? UserStatus.BLOCKED : UserStatus.ACTIVE;

  return prisma.user.update({
    where: { id: userId },
    data: { status },
  });
}

export async function updateUserRoleService(userId: string, role: Role) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}
