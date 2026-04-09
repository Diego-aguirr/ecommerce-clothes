"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProductSchema } from "@/lib/validations/product.schema";
import { useState, useTransition } from "react";
import { uploadProductImage, removeProductImage } from "@/actions/admin/upload";
import { createProduct, updateProduct } from "@/actions/admin/products";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Size, Gender } from "@/generated/prisma/enums";

// --- Tipos ---
// FormData usa z.input<> → campos con .default([]) son opcionales en el formulario
// El resolver los convierte al tipo de output al validar
type FormData = z.input<typeof CreateProductSchema>;
type ImageEntry = { url: string; publicId: string };

// Producto pre-cargado para modo edición
type ExistingProduct = {
  id: string;
  title: string;
  description: string;
  inStock: number;
  price: number;
  sizes: Size[];
  tags: string[];
  gender: Gender;
  categoryId: string;
  ProductImage: ImageEntry[];
};

type Props = {
  categories: { id: string; name: string }[];
  product?: ExistingProduct; // Si viene → modo edición
};

const ALL_SIZES = Object.values(Size);
const ALL_GENDERS = Object.values(Gender);

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const isEditMode = !!product;
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Imágenes existentes (solo edición) vs nuevas subidas de esta sesión
  const [existingImages, setExistingImages] = useState<ImageEntry[]>(
    product?.ProductImage ?? []
  );
  const [newImages, setNewImages] = useState<ImageEntry[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      title: product?.title ?? "",
      description: product?.description ?? "",
      inStock: product?.inStock ?? 0,
      price: product?.price ?? 0,
      sizes: product?.sizes ?? [],
      tags: product?.tags ?? [],
      gender: product?.gender ?? undefined,
      categoryId: product?.categoryId ?? "",
      images: product?.ProductImage ?? [],
    },
  });

  const selectedSizes = watch("sizes") ?? [];

  // Sincroniza el campo "images" del form con la realidad visual
  const syncImages = (existing: ImageEntry[], newImgs: ImageEntry[]) => {
    setValue("images", [...existing, ...newImgs], { shouldValidate: true });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setGlobalError(null);

    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadProductImage(fd);

    if (result.ok && result.url && result.publicId) {
      const entry: ImageEntry = { url: result.url, publicId: result.publicId };
      const updated = [...newImages, entry];
      setNewImages(updated);
      syncImages(existingImages, updated);
    } else {
      setGlobalError(result.error ?? "Error subiendo la imagen.");
    }
    setUploading(false);
    e.target.value = "";
  };

  // Quitar imagen EXISTENTE (quedó guardada en DB) → programar borrado en Cloudinary al guardar
  const removeExistingImage = (publicId: string) => {
    const updated = existingImages.filter((img) => img.publicId !== publicId);
    setExistingImages(updated);
    setImagesToDelete((prev) => [...prev, publicId]);
    syncImages(updated, newImages);
  };

  // Quitar imagen NUEVA (solo subida, nunca grabada en DB) → borrar en Cloudinary ya
  const removeNewImage = async (publicId: string) => {
    const updated = newImages.filter((img) => img.publicId !== publicId);
    setNewImages(updated);
    syncImages(existingImages, updated);
    await removeProductImage(publicId); // limpia Cloudinary al instante
  };

  const onSubmit = (data: FormData) => {
    setGlobalError(null);
    startTransition(async () => {
      const result = isEditMode
        ? await updateProduct(product!.id, { ...data, imagesToDelete })
        : await createProduct(data);

      if (result.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setGlobalError(result.error ?? "Hubo un error al guardar el producto.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {globalError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          ⚠️ {globalError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Columna izquierda: datos textuales ── */}
        <div className="space-y-5">
          <Field label="Título del producto" error={errors.title?.message}>
            <input
              {...register("title")}
              placeholder="Ej: Remera Oversize Negra"
              className={input(!!errors.title)}
            />
          </Field>

          <Field label="Descripción" error={errors.description?.message}>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Describe el producto..."
              className={input(!!errors.description)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio ($)" error={errors.price?.message}>
              <input
                type="number"
                step="0.01"
                min={0}
                {...register("price", { valueAsNumber: true })}
                className={input(!!errors.price)}
              />
            </Field>
            <Field label="Stock (unidades)" error={errors.inStock?.message}>
              <input
                type="number"
                min={0}
                {...register("inStock", { valueAsNumber: true })}
                className={input(!!errors.inStock)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoría" error={errors.categoryId?.message}>
              <select {...register("categoryId")} className={input(!!errors.categoryId)}>
                <option value="">Selecciona...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Género" error={errors.gender?.message}>
              <select {...register("gender")} className={input(!!errors.gender)}>
                <option value="">Selecciona...</option>
                {ALL_GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* ── Columna derecha: tallas + imágenes ── */}
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Tallas disponibles
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => {
                const isSelected = (selectedSizes as string[]).includes(size);
                return (
                  <button
                    type="button"
                    key={size}
                    onClick={() => {
                      const next = isSelected
                        ? (selectedSizes as string[]).filter((s) => s !== size)
                        : [...(selectedSizes as string[]), size];
                      setValue("sizes", next as Size[], { shouldValidate: true });
                    }}
                    className={`px-3 py-1.5 text-sm border-2 font-semibold rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {errors.sizes && (
              <span className="text-red-500 text-xs mt-1 block">{errors.sizes.message}</span>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Imágenes del producto
            </p>

            {/* Grid de previsualizaciones */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {existingImages.map((img) => (
                <ImagePreview
                  key={img.publicId}
                  url={img.url}
                  onRemove={() => removeExistingImage(img.publicId)}
                  badge="Guardada"
                />
              ))}
              {newImages.map((img) => (
                <ImagePreview
                  key={img.publicId}
                  url={img.url}
                  onRemove={() => removeNewImage(img.publicId)}
                  badge="Nueva"
                  badgeColor="text-blue-700 bg-blue-50"
                />
              ))}
            </div>

            <label
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 cursor-pointer transition-all ${
                uploading
                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "border-gray-900 bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              {uploading ? "Subiendo a Cloudinary…" : "＋ Añadir imagen"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>

            {errors.images && (
              <span className="text-red-500 text-xs mt-2 block">{errors.images.message}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending || uploading}
          className={`px-8 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition ${
            isPending || uploading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-gray-700 cursor-pointer"
          }`}
        >
          {isPending
            ? isEditMode
              ? "Actualizando…"
              : "Guardando…"
            : isEditMode
            ? "Guardar cambios"
            : "Crear producto"}
        </button>
      </div>
    </form>
  );
}

// ── Componentes internos auxiliares ──

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
    </div>
  );
}

function ImagePreview({
  url,
  onRemove,
  badge,
  badgeColor = "text-gray-600 bg-gray-100",
}: {
  url: string;
  onRemove: () => void;
  badge: string;
  badgeColor?: string;
}) {
  return (
    <div className="relative group rounded-xl border border-gray-200 overflow-hidden aspect-square bg-gray-50">
      <img src={url} alt="Vista previa" className="w-full h-full object-cover" />
      <span
        className={`absolute bottom-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badgeColor}`}
      >
        {badge}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}

// Utilidad de clases de inputs compartida
const input = (hasError: boolean) =>
  `w-full px-3 py-2.5 text-sm border-2 rounded-lg outline-none focus:border-gray-900 transition ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"
  }`;
