import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma and server-only before imports
vi.mock("@/lib/prisma", () => ({
  default: {
    productVariant: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    stockMovement: {
      create: vi.fn(),
    },
  },
}));

vi.mock("server-only", () => ({}));

import {
  getProductVariants,
  createProductVariant,
  updateVariantStock,
  toggleVariantStatus,
} from "./variant.service";
import prisma from "@/lib/prisma";

const PRODUCT_ID = "550e8400-e29b-41d4-a716-446655440000";
const VARIANT_ID = "550e8400-e29b-41d4-a716-446655440001";
const VARIANT_ID_2 = "550e8400-e29b-41d4-a716-446655440002";

describe("Variant Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProductVariants", () => {
    it("should return variants for a product", async () => {
      const mockVariants = [
        { id: VARIANT_ID, sku: "REM-ROJ-M", size: "M", color: "rojo", stock: 10 },
        { id: VARIANT_ID_2, sku: "REM-AZU-L", size: "L", color: "azul", stock: 5 },
      ];
      vi.mocked(prisma.productVariant.findMany).mockResolvedValue(mockVariants as any);

      const result = await getProductVariants(PRODUCT_ID);

      expect(prisma.productVariant.findMany).toHaveBeenCalledWith({
        where: { productId: PRODUCT_ID },
        orderBy: [{ color: "asc" }, { size: "asc" }],
      });
      expect(result).toEqual(mockVariants);
    });
  });

  describe("createProductVariant", () => {
    it("should create a variant", async () => {
      const mockVariant = {
        id: VARIANT_ID,
        productId: PRODUCT_ID,
        sku: "REM-ROJ-M",
        size: "M",
        color: "rojo",
        stock: 10,
        isActive: true,
      };
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.productVariant.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.productVariant.create).mockResolvedValue(mockVariant as any);

      const result = await createProductVariant({
        productId: PRODUCT_ID,
        sku: "REM-ROJ-M",
        size: "M",
        color: "rojo",
        stock: 10,
      });

      expect(prisma.productVariant.create).toHaveBeenCalled();
      expect(result).toEqual(mockVariant);
    });

    it("should throw if SKU already exists", async () => {
      const existingVariant = { id: VARIANT_ID, sku: "REM-ROJ-M" };
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(existingVariant as any);

      await expect(
        createProductVariant({
          productId: PRODUCT_ID,
          sku: "REM-ROJ-M",
          size: "M",
          color: "rojo",
          stock: 10,
        })
      ).rejects.toThrow("Ya existe una variante con ese SKU");
    });

    it("should throw if color+size combination exists", async () => {
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);
      const existingVariant = { id: VARIANT_ID, color: "rojo", size: "M" };
      vi.mocked(prisma.productVariant.findFirst).mockResolvedValue(existingVariant as any);

      await expect(
        createProductVariant({
          productId: PRODUCT_ID,
          sku: "REM-ROJ-M-2",
          size: "M",
          color: "rojo",
          stock: 10,
        })
      ).rejects.toThrow("Ya existe una variante con color rojo y talla M");
    });

    it("should create stock movement if stock > 0", async () => {
      const mockVariant = {
        id: VARIANT_ID,
        productId: PRODUCT_ID,
        sku: "REM-ROJ-M",
        size: "M",
        color: "rojo",
        stock: 10,
        isActive: true,
      };
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.productVariant.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.productVariant.create).mockResolvedValue(mockVariant as any);
      vi.mocked(prisma.stockMovement.create).mockResolvedValue({} as any);

      await createProductVariant({
        productId: PRODUCT_ID,
        sku: "REM-ROJ-M",
        size: "M",
        color: "rojo",
        stock: 10,
      });

      expect(prisma.stockMovement.create).toHaveBeenCalledWith({
        data: {
          productId: PRODUCT_ID,
          variantId: VARIANT_ID,
          type: "restock",
          quantity: 10,
          note: "Stock inicial al crear variante",
        },
      });
    });
  });

  describe("updateVariantStock", () => {
    it("should update stock and create movement", async () => {
      const mockVariant = { id: VARIANT_ID, stock: 10, productId: PRODUCT_ID };
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(mockVariant as any);
      vi.mocked(prisma.productVariant.update).mockResolvedValue({ ...mockVariant, stock: 20 } as any);
      vi.mocked(prisma.stockMovement.create).mockResolvedValue({} as any);

      const result = await updateVariantStock({
        variantId: VARIANT_ID,
        stock: 20,
        note: "Restock",
      });

      expect(prisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: VARIANT_ID },
        data: { stock: 20 },
      });
      expect(prisma.stockMovement.create).toHaveBeenCalled();
      expect(result).toEqual({ previousStock: 10, newStock: 20 });
    });

    it("should throw if variant not found", async () => {
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);

      await expect(
        updateVariantStock({
          variantId: "550e8400-e29b-41d4-a716-446655440099",
          stock: 20,
        })
      ).rejects.toThrow("Variante no encontrada");
    });
  });

  describe("toggleVariantStatus", () => {
    it("should toggle variant status", async () => {
      const mockVariant = { id: VARIANT_ID, isActive: false, productId: PRODUCT_ID };
      vi.mocked(prisma.productVariant.update).mockResolvedValue({ ...mockVariant, isActive: true } as any);

      const result = await toggleVariantStatus(VARIANT_ID, true);

      expect(prisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: VARIANT_ID },
        data: { isActive: true },
      });
      expect(result).toEqual({ ...mockVariant, isActive: true });
    });
  });
});
