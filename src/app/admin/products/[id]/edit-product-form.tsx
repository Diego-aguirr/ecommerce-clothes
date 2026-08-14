"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProductSchema } from "@/lib/validations/product.schema";
import { useState, useTransition } from "react";
import { updateProduct } from "@/actions/admin/products";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Size, Gender } from "@/generated/prisma/enums";
import { EditProductTabs } from "@/components/admin/products/edit-product-tabs";

type FormData = z.input<typeof CreateProductSchema>;
type ImageEntry = { url: string; publicId: string };

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

type Props = {
  product: ExistingProduct;
  categories: { id: string; name: string }[];
  existingColors: ExistingColor[];
  existingVariants: ExistingVariant[];
};

export function EditProductForm({
  product,
  categories,
  existingColors,
  existingVariants,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      title: product.title,
      description: product.description,
      price: product.price,
      sizes: product.sizes,
      tags: product.tags,
      gender: product.gender,
      categoryId: product.categoryId,
      images: product.ProductImage,
      colors: [{ color: "default", label: "Único", hexCode: "#808080" }],
      variants: [],
    },
  });

  const onSubmit = (formData: FormData) => {
    setGlobalError(null);

    startTransition(async () => {
      const result = await updateProduct(product.id, {
        ...formData,
        images: formData.images || [],
        imagesToDelete: [],
      });

      if (result.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setGlobalError(
          result.error ?? "Hubo un error al guardar el producto."
        );
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

      <EditProductTabs
        product={product}
        categories={categories}
        existingColors={existingColors}
        existingVariants={existingVariants}
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
      />

      {/* Submit */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className={`px-6 py-2 text-sm font-medium rounded-lg ${
            isPending
              ? "bg-gray-400 text-white"
              : "bg-gray-900 text-white hover:bg-gray-700"
          } transition`}
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
