import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma and server-only before imports
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("server-only", () => ({}));

import { toggleUserBlockService, updateUserRoleService } from "./user.service";
import prisma from "@/lib/prisma";

describe("User Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("toggleUserBlockService", () => {
    it("should block a user", async () => {
      const mockUser = { id: "user-1", status: "BLOCKED" };
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

      const result = await toggleUserBlockService("user-1", true);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { status: "BLOCKED" },
      });
      expect(result).toEqual(mockUser);
    });

    it("should unblock a user", async () => {
      const mockUser = { id: "user-1", status: "ACTIVE" };
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

      const result = await toggleUserBlockService("user-1", false);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { status: "ACTIVE" },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("updateUserRoleService", () => {
    it("should update user role", async () => {
      const mockUser = { id: "user-1", role: "admin" };
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

      const result = await updateUserRoleService("user-1", "admin" as any);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { role: "admin" },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
