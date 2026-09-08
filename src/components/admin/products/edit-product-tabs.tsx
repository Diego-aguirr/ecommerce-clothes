"use client";

import { useState } from "react";
import { Size, Gender } from "@/generated/prisma/enums";
import { StepBasicData } from "./step-basic-data";
import { StepImages } from "./step-images";
import { StepColors } from "./step-colors";
import { StepVariants } from "./step-variants";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { z } from "zod";
import { CreateProductSchema } from "@/lib/validations/product.schema";

type ImageEntry = { url: string; publicId: string };
type ColorEntry = { color: string; label: string; hexCode: string };
type VariantEntry = { sku: string; size: string; color: string; stock: number };

type ExistingProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  sizes: Size[];
  tags: string[];
  gender: Gender;
  categoryId: string;
  ProductImage: ImageEntry[];
};

type ExistingColor = {
  id: string;
  color: string;
  label: string;
  hexCode: string | null;
  images: { id: string; url: string; order: number }[];
};

type ExistingVariant = {
  id: string;
  sku: string;
  size: Size;
  color: string;
  stock: number;
  isActive: boolean;
};

type Tab = "datos" | "imagenes" | "colores" | "stock";

 
// FIXME(Phase 6): Replace any with z.input<typeof CreateProductSchema> after form refactor
type EditProductTabsProps = {
  product: ExistingProduct;
  categories: { id: string; name: string }[];
  existingColors: ExistingColor[];
  existingVariants: ExistingVariant[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: (name: string) => any;
};
 

const TABS: { key: Tab; label: string }[] = [
  { key: "datos", label: "Datos" },
  { key: "imagenes", label: "Imágenes" },
  { key: "colores", label: "Colores" },
  { key: "stock", label: "Stock" },
];

export function EditProductTabs({
  product,
  categories,
  existingColors,
  existingVariants,
  register,
  errors,
  setValue,
  watch,
}: EditProductTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("datos");
  const [images, setImages] = useState<ImageEntry[]>(product.ProductImage);
  const [colors, setColors] = useState<ColorEntry[]>(
    existingColors.map((c) => ({
      color: c.color,
      label: c.label,
      hexCode: c.hexCode ?? "#808080",
    }))
  );

  // Convert existing variants to the format expected by VariantMatrix
  const [variants, setVariants] = useState<VariantEntry[]>(() => {
    // Generate all possible variants from colors × sizes
    const allVariants: VariantEntry[] = [];
    colors.forEach((color) => {
      product.sizes.forEach((size) => {
        const existing = existingVariants.find(
          (v) => v.color === color.color && v.size === size
        );
        allVariants.push({
          sku: existing?.sku ?? `${product.title.substring(0, 10).toUpperCase().replace(/\s+/g, "_")}-${color.color.toUpperCase()}-${size}`,
          size,
          color: color.color,
          stock: existing?.stock ?? 0,
        });
      });
    });
    return allVariants;
  });

  const selectedSizes: string[] = watch("sizes") ?? product.sizes;
  const title = watch("title") ?? product.title;

  const handleToggleSize = (size: Size) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter((s: string) => s !== size)
      : [...selectedSizes, size];
    setValue("sizes", next, { shouldValidate: true });
  };

  const handleColorsChange = (newColors: ColorEntry[]) => {
    setColors(newColors);
    // Regenerate variants
    const newVariants: VariantEntry[] = [];
    newColors.forEach((color) => {
      selectedSizes.forEach((size) => {
        const existing = variants.find(
          (v) => v.color === color.color && v.size === size
        );
        newVariants.push({
          sku:
            existing?.sku ??
            `${title.substring(0, 10).toUpperCase().replace(/\s+/g, "_")}-${color.color.toUpperCase()}-${size}`,
          size,
          color: color.color,
          stock: existing?.stock ?? 0,
        });
      });
    });
    setVariants(newVariants);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {activeTab === "datos" && (
          <StepBasicData
            register={register}
            errors={errors}
            selectedSizes={selectedSizes}
            onToggleSize={handleToggleSize}
            categories={categories}
          />
        )}
        {activeTab === "imagenes" && (
          <StepImages images={images} onChange={setImages} />
        )}
        {activeTab === "colores" && (
          <StepColors colors={colors} onChange={handleColorsChange} />
        )}
        {activeTab === "stock" && (
          <StepVariants
            colors={colors}
            sizes={selectedSizes}
            variants={variants}
            onChange={(v) => setVariants(v)}
            productName={title}
          />
        )}
      </div>
    </div>
  );
}
