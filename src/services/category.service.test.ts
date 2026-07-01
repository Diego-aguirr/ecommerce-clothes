import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma and server-only before imports
vi.mock("@/lib/prisma", () => ({
  default: {
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("server-only", () => ({}));

import {
  getCategoriesService,
  createCategoryService,
  deleteCategoryService,
} from "./category.service";
import prisma from "@/lib/prisma";

describe("Category Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCategoriesService", () => {
    it("should return all categories with product count", async () => {
      const mockCategories = [
        { id: "1", name: "Remeras", _count: { Product: 5 } },
        { id: "2", name: "Buzos", _count: { Product: 3 } },
      ];
      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any);

      const result = await getCategoriesService();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { Product: true },
          },
        },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe("createCategoryService", () => {
    it("should create a category", async () => {
      const mockCategory = { id: "1", name: "Remeras" };
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.category.create).mockResolvedValue(mockCategory as any);

      const result = await createCategoryService("Remeras");

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: "Remeras" },
      });
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: "Remeras" },
      });
      expect(result).toEqual(mockCategory);
    });

    it("should throw if category already exists", async () => {
      const existingCategory = { id: "1", name: "Remeras" };
      vi.mocked(prisma.category.findUnique).mockResolvedValue(existingCategory as any);

      await expect(createCategoryService("Remeras")).rejects.toThrow(
        "Ya existe una categoría con ese nombre"
      );
    });
  });

  describe("deleteCategoryService", () => {
    it("should delete a category", async () => {
      const mockCategory = { id: "1", name: "Remeras", _count: { Product: 0 } };
      vi.mocked(prisma.category.findUnique).mockResolvedValue(mockCategory as any);
      vi.mocked(prisma.category.delete).mockResolvedValue(mockCategory as any);

      const result = await deleteCategoryService("1");

      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(result).toEqual(mockCategory);
    });

    it("should throw if category not found", async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      await expect(deleteCategoryService("nonexistent")).rejects.toThrow(
        "Categoría no encontrada"
      );
    });

    it("should throw if category has products", async () => {
      const mockCategory = { id: "1", name: "Remeras", _count: { Product: 5 } };
      vi.mocked(prisma.category.findUnique).mockResolvedValue(mockCategory as any);

      await expect(deleteCategoryService("1")).rejects.toThrow(
        "No se puede eliminar"
      );
    });
  });
});
