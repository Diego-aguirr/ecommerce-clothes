"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProductSchema } from "@/lib/validations/product.schema";
import { useState, useTransition } from "react";
import { createProduct, updateProduct } from "@/actions/admin/products";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Size, Gender } from "@/generated/prisma/enums";
import { StepBasicData } from "./step-basic-data";
import { StepImages } from "./step-images";
import { StepColors } from "./step-colors";
import { StepVariants } from "./step-variants";
import { FiCheck } from "react-icons/fi";

type FormData = z.input<typeof CreateProductSchema>;
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

type Props = {
  categories: { id: string; name: string }[];
  product?: ExistingProduct;
};

const STEPS = ["Datos", "Imágenes", "Colores", "Variantes"] as const;

function generateVariants(
  colors: ColorEntry[],
  sizes: string[],
  title: string
): VariantEntry[] {
  if (colors.length === 0 || sizes.length === 0) return [];

  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  const titleSlug = (title || "PROD")
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
    .slice(0, 15);

  const generated: VariantEntry[] = [];
  colors.forEach((color, cIdx) => {
    sizes.forEach((size, sIdx) => {
      const colorSuffix =
        color.color === "default"
          ? "DEF"
          : color.color.toUpperCase().slice(0, 10);
      const sku = `${titleSlug}-${colorSuffix}-${size}-${timestamp}${cIdx}${sIdx}`;
      generated.push({ sku, size, color: color.color, stock: 0 });
    });
  });
  return generated;
}

export function ProductWizard({ categories, product }: Props) {
  const router = useRouter();
  const isEditMode = !!product;
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);

  // Form data
  const [images, setImages] = useState<ImageEntry[]>(
    product?.ProductImage ?? []
  );
  const [colors, setColors] = useState<ColorEntry[]>([
    { color: "default", label: "Único", hexCode: "#808080" },
  ]);
  const [variants, setVariants] = useState<VariantEntry[]>([]);

   
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof CreateProductSchema>>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      title: product?.title ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      sizes: product?.sizes ?? [],
      tags: product?.tags ?? [],
      gender: product?.gender ?? undefined,
      categoryId: product?.categoryId ?? "",
      images: product?.ProductImage ?? [],
      colors: [{ color: "default", label: "Único", hexCode: "#808080" }],
      variants: [],
    },
  });
   

  const selectedSizes: Size[] = watch("sizes") ?? [];
  const title: string = watch("title") ?? "";

  // Step validation
  const canGoNext = () => {
    switch (currentStep) {
      case 0: // Datos
        return (
          watch("title") &&
          watch("price") > 0 &&
          watch("categoryId") &&
          watch("gender") &&
          selectedSizes.length > 0
        );
      case 1: // Imágenes
        return images.length > 0;
      case 2: // Colores
        return colors.length > 0;
      case 3: // Variantes
        return variants.length > 0;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (currentStep === 0) {
      // When moving from step 0, generate initial variants
      const newVariants = generateVariants(colors, selectedSizes, title);
      if (newVariants.length > 0 && variants.length === 0) {
        setVariants(newVariants);
      }
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleToggleSize = (size: Size) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setValue("sizes", next, { shouldValidate: true });

    // Regenerate variants with new sizes
    const newVariants = generateVariants(colors, next, title);
    setVariants(newVariants);
  };

  const handleColorsChange = (newColors: ColorEntry[]) => {
    setColors(newColors);
    // Regenerate variants with new colors
    const newVariants = generateVariants(newColors, selectedSizes, title);
    setVariants(newVariants);
  };

  const onSubmit = (formData: FormData) => {
    setGlobalError(null);

    if (images.length === 0) {
      setGlobalError("Debes subir al menos una imagen del producto.");
      return;
    }

    const finalData = {
      ...formData,
      images,
    };

    if (!isEditMode) {
      if (variants.length === 0) {
        setGlobalError("Generá al menos una variante con stock.");
        return;
      }

      // Validate unique SKUs
      const skus = variants.map((v) => v.sku);
      const duplicates = skus.filter((sku, i) => skus.indexOf(sku) !== i);
      if (duplicates.length > 0) {
        setGlobalError(
          `SKU duplicado: ${duplicates[0]}. Cada variante debe tener un SKU único.`
        );
        return;
      }

      Object.assign(finalData, { colors, variants });
    }

    startTransition(async () => {
      const result = isEditMode
        ? await updateProduct(product!.id, { ...finalData, imagesToDelete: [] })
        : await createProduct(finalData);

      if (result.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        let errorMsg = result.error ?? "Hubo un error al guardar el producto.";
        if (errorMsg.includes("P2002") && errorMsg.includes("sku")) {
          errorMsg =
            "Ya existe una variante con ese SKU. Cambia el SKU manualmente.";
        } else if (errorMsg.includes("P2002")) {
          errorMsg =
            "Ya existe un producto con ese título. Usa un título diferente.";
        }
        setGlobalError(errorMsg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {globalError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {globalError}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => idx <= currentStep && setCurrentStep(idx)}
              disabled={idx > currentStep}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                idx === currentStep
                  ? "bg-foreground text-white"
                  : idx < currentStep
                  ? "bg-green-100 text-green-700"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {idx < currentStep ? (
                <FiCheck size={14} />
              ) : (
                <span className="w-5 h-5 rounded-full bg-background/20 flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
              )}
              <span className="hidden sm:inline">{step}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  idx < currentStep ? "bg-green-300" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-card rounded-2xl shadow-sm border border-muted p-6 min-h-[300px]">
        {currentStep === 0 && (
          <StepBasicData
            register={register}
            errors={errors}
            selectedSizes={selectedSizes}
            onToggleSize={handleToggleSize}
            categories={categories}
          />
        )}
        {currentStep === 1 && <StepImages images={images} onChange={setImages} />}
        {currentStep === 2 && (
          <StepColors colors={colors} onChange={handleColorsChange} />
        )}
        {currentStep === 3 && (
          <StepVariants
            colors={colors}
            sizes={selectedSizes}
            variants={variants}
            onChange={(v) => setVariants(v)}
            productName={title}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={currentStep === 0 ? () => router.back() : goBack}
          className="px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition"
        >
          {currentStep === 0 ? "Cancelar" : "← Anterior"}
        </button>

        <div className="flex items-center gap-3">
          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext()}
              className="px-6 py-2 text-sm font-medium rounded-lg bg-foreground text-white hover:bg-foreground disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending || !canGoNext()}
              className={`px-6 py-2 text-sm font-medium rounded-lg ${
                isPending || !canGoNext()
                  ? "bg-muted text-muted-foreground"
                  : "bg-foreground text-white hover:bg-foreground"
              } transition`}
            >
              {isPending
                ? isEditMode
                  ? "Actualizando..."
                  : "Creando..."
                : isEditMode
                ? "Guardar cambios"
                : "Crear producto"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
