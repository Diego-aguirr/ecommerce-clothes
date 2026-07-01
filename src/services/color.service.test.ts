import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma and server-only before imports
vi.mock("@/lib/prisma", () => ({
  default: {
    productColor: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    productVariant: {
      count: vi.fn(),
    },
  },
}));

vi.mock("server-only", () => ({}));

import {
  getProductColors,
  createProductColor,
  deleteProductColor,
} from "./color.service";
import prisma from "@/lib/prisma";

const PRODUCT_ID = "550e8400-e29b-41d4-a716-446655440000";
const COLOR_ID = "550e8400-e29b-41d4-a716-446655440001";

describe("Color Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProductColors", () => {
    it("should return colors for a product", async () => {
      const mockColors = [
        { id: COLOR_ID, color: "rojo", label: "Rojo", images: [], _count: { images: 0 } },
        { id: "550e8400-e29b-41d4-a716-446655440002", color: "azul", label: "Azul", images: [], _count: { images: 2 } },
      ];
      vi.mocked(prisma.productColor.findMany).mockResolvedValue(mockColors as any);

      const result = await getProductColors(PRODUCT_ID);

      expect(prisma.productColor.findMany).toHaveBeenCalledWith({
        where: { productId: PRODUCT_ID },
        include: {
          images: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { images: true },
          },
        },
        orderBy: { label: "asc" },
      });
      expect(result).toEqual({ ok: true, colors: mockColors });
    });
  });

  describe("createProductColor", () => {
    it("should create a product color", async () => {
      const mockColor = { id: COLOR_ID, color: "rojo", label: "Rojo", hexCode: "#FF0000" };
      vi.mocked(prisma.productColor.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.productColor.create).mockResolvedValue(mockColor as any);

      const result = await createProductColor({
        productId: PRODUCT_ID,
        color: "rojo",
        label: "Rojo",
        hexCode: "#FF0000",
      });

      expect(prisma.productColor.create).toHaveBeenCalled();
      expect(result).toEqual({ ok: true, color: mockColor });
    });

    it("should return error if color already exists", async () => {
      const existingColor = { id: COLOR_ID, color: "rojo", label: "Rojo" };
      vi.mocked(prisma.productColor.findFirst).mockResolvedValue(existingColor as any);

      const result = await createProductColor({
        productId: PRODUCT_ID,
        color: "rojo",
        label: "Rojo",
      });

      expect(result).toEqual({
        ok: false,
        message: "Ya existe un color con el nombre 'rojo'",
      });
    });
  });

  describe("deleteProductColor", () => {
    it("should delete a product color", async () => {
      vi.mocked(prisma.productVariant.count).mockResolvedValue(0);
      vi.mocked(prisma.productColor.delete).mockResolvedValue({} as any);

      const result = await deleteProductColor(COLOR_ID);

      expect(prisma.productColor.delete).toHaveBeenCalledWith({
        where: { id: COLOR_ID },
      });
      expect(result).toEqual({ ok: true });
    });

    it("should return error if color has variants", async () => {
      vi.mocked(prisma.productVariant.count).mockResolvedValue(3);

      const result = await deleteProductColor(COLOR_ID);

      expect(result).toEqual({
        ok: false,
        message: "No se puede eliminar: hay 3 variantes usando este color",
      });
    });
  });
});
