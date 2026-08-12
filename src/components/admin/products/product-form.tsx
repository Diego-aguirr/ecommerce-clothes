"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProductSchema } from "@/lib/validations/product.schema";
import { useState, useTransition, useEffect } from "react";
import { uploadProductImage, removeProductImage } from "@/actions/admin/upload";
import { createProduct, updateProduct } from "@/actions/admin/products";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Size, Gender } from "@/generated/prisma/enums";

type FormData = z.input<typeof CreateProductSchema>;
type ImageEntry = { url: string; publicId: string };
type ColorEntry = { color: string; label: string; hexCode: string };
type VariantEntry = { sku: string; size: Size; color: string; stock: number };

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

const ALL_SIZES = Object.values(Size);
const ALL_GENDERS = Object.values(Gender);
const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const isEditMode = !!product;
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [existingImages, setExistingImages] = useState<ImageEntry[]>(product?.ProductImage ?? []);
  const [newImages, setNewImages] = useState<ImageEntry[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // Solo para modo creación
  const [colors, setColors] = useState<ColorEntry[]>([{ color: "default", label: "Único", hexCode: "#808080" }]);
  const [variants, setVariants] = useState<VariantEntry[]>([]);
  const [showColorForm, setShowColorForm] = useState(false);
  const [newColor, setNewColor] = useState<ColorEntry>({ color: "", label: "", hexCode: "#000000" });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
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

  const selectedSizes = watch("sizes") ?? [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allImages = [...existingImages, ...newImages];

  // 🔄 Sincroniza React state → form state para que Zod vea los valores reales
  useEffect(() => {
    setValue("images", allImages, { shouldValidate: false });
  }, [allImages, setValue]);

  useEffect(() => {
    if (!isEditMode) {
      setValue("colors", colors, { shouldValidate: false });
    }
  }, [colors, isEditMode, setValue]);

  useEffect(() => {
    if (!isEditMode) {
      setValue("variants", variants, { shouldValidate: false });
    }
  }, [variants, isEditMode, setValue]);

  // Generar variantes automáticamente
  const generateVariants = () => {
    if (colors.length === 0 || selectedSizes.length === 0) {
      setVariants([]);
      return;
    }

    const generated: VariantEntry[] = [];
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
    
    colors.forEach((color, cIdx) => {
      selectedSizes.forEach((size, sIdx) => {
        const colorSuffix = color.color === "default" ? "DEF" : color.color.toUpperCase().slice(0, 10);
        const titleSlug = (watch("title") || "PROD").toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "").slice(0, 15);
        const sku = `${titleSlug}-${colorSuffix}-${size}-${timestamp}${cIdx}${sIdx}`;
        
        generated.push({ sku, size: size as Size, color: color.color, stock: 0 });
      });
    });

    setVariants(generated);
  };

  // Handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setGlobalError(null);

    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadProductImage(fd);

    if (result.ok && result.url && result.publicId) {
      const updated = [...newImages, { url: result.url, publicId: result.publicId }];
      setNewImages(updated);
      setValue("images", [...existingImages, ...updated], { shouldValidate: true });
    } else {
      setGlobalError(result.error ?? "Error subiendo la imagen.");
    }
    
    setUploading(false);
    e.target.value = "";
  };

  const removeExistingImage = (publicId: string) => {
    const updated = existingImages.filter((img) => img.publicId !== publicId);
    setExistingImages(updated);
    setImagesToDelete((prev) => [...prev, publicId]);
    setValue("images", [...updated, ...newImages], { shouldValidate: true });
  };

  const removeNewImage = async (publicId: string) => {
    const updated = newImages.filter((img) => img.publicId !== publicId);
    setNewImages(updated);
    setValue("images", [...existingImages, ...updated], { shouldValidate: true });
    await removeProductImage(publicId);
  };

  const addColor = () => {
    if (!newColor.label || !newColor.color || !HEX_REGEX.test(newColor.hexCode)) {
      setGlobalError("Completa todos los campos del color correctamente. El formato HEX debe ser #RRGGBB");
      return;
    }
    
    const updatedColors = [...colors, { ...newColor, color: newColor.color.toLowerCase().replace(/\s+/g, "_") }];
    setColors(updatedColors);
    setNewColor({ color: "", label: "", hexCode: "#000000" });
    setShowColorForm(false);
    setGlobalError(null);
    
    // Regenerar variantes con el nuevo color
    if (selectedSizes.length > 0) {
      const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
      const titleSlug = (watch("title") || "PROD").toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "").slice(0, 15);
      const newVariants: VariantEntry[] = [];
      
      updatedColors.forEach((color, cIdx) => {
        selectedSizes.forEach((size, sIdx) => {
          const colorSuffix = color.color === "default" ? "DEF" : color.color.toUpperCase().slice(0, 10);
          const sku = `${titleSlug}-${colorSuffix}-${size}-${timestamp}${cIdx}${sIdx}`;
          newVariants.push({ sku, size: size as Size, color: color.color, stock: 0 });
        });
      });
      
      setVariants(newVariants);
    }
  };

  const removeColor = (colorToRemove: string) => {
    if (colors.length <= 1) {
      setGlobalError("Debe haber al menos un color");
      return;
    }
    const updated = colors.filter((c) => c.color !== colorToRemove);
    setColors(updated);
    
    // Regenerar variantes sin el color removido
    if (selectedSizes.length > 0) {
      const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
      const titleSlug = (watch("title") || "PROD").toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "").slice(0, 15);
      const newVariants: VariantEntry[] = [];
      updated.forEach((color, cIdx) => {
        selectedSizes.forEach((size, sIdx) => {
          const colorSuffix = color.color === "default" ? "DEF" : color.color.toUpperCase().slice(0, 10);
          const sku = `${titleSlug}-${colorSuffix}-${size}-${timestamp}${cIdx}${sIdx}`;
          newVariants.push({ sku, size: size as Size, color: color.color, stock: 0 });
        });
      });
      setVariants(newVariants);
    } else {
      setVariants([]);
    }
  };

  const updateVariant = (index: number, field: keyof VariantEntry, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const onSubmit = (formData: FormData) => {
    setGlobalError(null);
    
    if (allImages.length === 0) {
      setGlobalError("Debes subir al menos una imagen del producto.");
      return;
    }
    
    // Preparar datos finales
    const finalData = {
      ...formData,
      images: allImages,
    };
    
    if (!isEditMode) {
      if (variants.length === 0) {
        setGlobalError("Selecciona al menos una talla para generar variantes.");
        return;
      }
      
      // Validar SKUs únicos
      const skus = variants.map(v => v.sku);
      const duplicates = skus.filter((sku, i) => skus.indexOf(sku) !== i);
      if (duplicates.length > 0) {
        setGlobalError(`SKU duplicado: ${duplicates[0]}. Cada variante debe tener un SKU único.`);
        return;
      }
      
      // Agregar colores y variantes para modo creación
      Object.assign(finalData, { colors, variants });
    }
    
    startTransition(async () => {
      const result = isEditMode
        ? await updateProduct(product!.id, { ...finalData, imagesToDelete })
        : await createProduct(finalData);

      if (result.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        let errorMsg = result.error ?? "Hubo un error al guardar el producto.";
        if (errorMsg.includes("P2002") && errorMsg.includes("sku")) {
          errorMsg = "Ya existe una variante con ese SKU. Cambia el SKU manualmente.";
        } else if (errorMsg.includes("P2002")) {
          errorMsg = "Ya existe un producto con ese título. Usa un título diferente.";
        }
        setGlobalError(errorMsg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {globalError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          ⚠️ {globalError}
        </div>
      )}

      {/* Datos básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input {...register("title")} className="input" placeholder="Ej: Remera Negra" />
          {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($) *</label>
          <input type="number" step="0.01" {...register("price", { valueAsNumber: true })} className="input" />
          {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
        <textarea {...register("description")} rows={3} className="input" placeholder="Describe el producto..." />
        {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
          <select {...register("categoryId")} className="input">
            <option value="">Selecciona...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <span className="text-red-500 text-xs">{errors.categoryId.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Género *</label>
          <select {...register("gender")} className="input">
            <option value="">Selecciona...</option>
            {ALL_GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          {errors.gender && <span className="text-red-500 text-xs">{errors.gender.message}</span>}
        </div>
      </div>

      {/* Imágenes */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes ({allImages.length}) *</label>
        
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-3">
          {allImages.map((img, idx) => (
            <div key={img.publicId} className="relative aspect-square rounded-lg border overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url.startsWith("http") ? img.url : `/products/${img.url}`} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => idx < existingImages.length ? removeExistingImage(img.publicId) : removeNewImage(img.publicId)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer ${uploading ? "bg-gray-100 text-gray-400" : "bg-gray-900 text-white hover:bg-gray-700"}`}>
          {uploading ? "Subiendo..." : "＋ Agregar imagen"}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>
      </div>

      {/* Tallas */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tallas *</label>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => {
                  const next = isSelected ? selectedSizes.filter((s) => s !== size) : [...selectedSizes, size];
                  setValue("sizes", next, { shouldValidate: true });
                  if (!isEditMode) setTimeout(generateVariants, 0);
                }}
                className={`px-3 py-1.5 text-sm border-2 font-medium rounded-lg transition ${
                  isSelected ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
        {errors.sizes && <span className="text-red-500 text-xs">{errors.sizes.message}</span>}
      </div>

      {/* SOLO PARA CREACIÓN: Colores y Variantes */}
      {!isEditMode && (
        <>
          {/* Colores */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Colores *</label>
              <span className="text-xs text-gray-500">{colors.length} color{colors.length !== 1 && 'es'}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {colors.map((color) => (
                <div key={color.color} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border">
                  <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hexCode }} />
                  <span className="text-sm">{color.label}</span>
                  {colors.length > 1 && (
                    <button type="button" onClick={() => removeColor(color.color)} className="text-red-500 hover:text-red-700 text-xs">×</button>
                  )}
                </div>
              ))}
            </div>

            {showColorForm ? (
              <div className="p-3 bg-gray-50 rounded-lg border space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre (ej: Rojo)"
                    value={newColor.label}
                    onChange={(e) => setNewColor({ ...newColor, label: e.target.value })}
                    className="input text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Código (ej: rojo)"
                    value={newColor.color}
                    onChange={(e) => setNewColor({ ...newColor, color: e.target.value })}
                    className="input text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <input type="color" value={newColor.hexCode} onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })} className="w-10 h-8 rounded border" />
                  <input
                    type="text"
                    placeholder="#FF0000"
                    value={newColor.hexCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (val === "" || /^#[0-9A-F]{0,6}$/.test(val)) setNewColor({ ...newColor, hexCode: val });
                    }}
                    className="input text-sm flex-1"
                    maxLength={7}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={addColor} className="flex-1 py-1.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-700">Agregar</button>
                  <button type="button" onClick={() => setShowColorForm(false)} className="px-3 py-1.5 border text-sm rounded hover:bg-gray-50">Cancelar</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setShowColorForm(true)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">＋ Agregar color</button>
            )}
          </div>

          {/* Variantes - Tabla horizontal compacta */}
          {variants.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Variantes *</label>
                <button type="button" onClick={generateVariants} className="text-xs text-blue-600 hover:text-blue-800">Regenerar SKUs</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 text-xs">
                      <th className="pb-2">SKU</th>
                      <th className="pb-2">Color</th>
                      <th className="pb-2">Talla</th>
                      <th className="pb-2 w-24">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {variants.map((variant, idx) => {
                      const isDuplicate = variants.filter((v, i) => i !== idx && v.sku === variant.sku).length > 0;
                      return (
                        <tr key={`${variant.color}-${variant.size}`} className={isDuplicate ? "bg-red-50" : ""}>
                          <td className="py-2">
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                              className={`w-full px-2 py-1 text-xs border rounded ${isDuplicate ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                            />
                          </td>
                          <td className="py-2 text-xs">{colors.find(c => c.color === variant.color)?.label}</td>
                          <td className="py-2 text-xs">{variant.size}</td>
                          <td className="py-2">
                            <input
                              type="number"
                              min={0}
                              value={variant.stock}
                              onChange={(e) => updateVariant(idx, "stock", parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {variants.some((v, i) => variants.filter((va, idx) => idx !== i && va.sku === v.sku).length > 0) && (
                <p className="text-xs text-red-500 mt-2">⚠️ Hay SKU duplicados. Cambia el SKU manualmente.</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Links para edición */}
      {isEditMode && product && (
        <div className="border-t pt-4 flex gap-4">
          <a href={`/admin/products/${product.id}/variants`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">→ Gestionar variantes</a>
          <a href={`/admin/products/${product.id}/colors`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">→ Gestionar colores</a>
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center justify-between pt-4 border-t">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-50">Cancelar</button>
        <button
          type="submit"
          disabled={isPending || uploading}
          className={`px-6 py-2 text-sm font-medium rounded-lg ${isPending || uploading ? "bg-gray-400 text-white" : "bg-gray-900 text-white hover:bg-gray-700"}`}
        >
          {isPending ? (isEditMode ? "Actualizando..." : "Creando...") : (isEditMode ? "Guardar cambios" : "Crear producto")}
        </button>
      </div>

      <style jsx>{`
        .input {
          @apply w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-gray-900 transition;
        }
      `}</style>
    </form>
  );
}
