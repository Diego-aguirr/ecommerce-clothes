"use client";

import { Size, Gender } from "@/generated/prisma/enums";
import { UseFormRegister, FieldErrors } from "react-hook-form";

const ALL_SIZES = Object.values(Size);
const ALL_GENDERS = Object.values(Gender);

type FormData = {
  title: string;
  description: string;
  price: number;
  sizes: Size[];
  tags: string[];
  gender: Gender;
  categoryId: string;
};

type StepBasicDataProps = {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  selectedSizes: string[];
  onToggleSize: (size: Size) => void;
  categories: { id: string; name: string }[];
};

export function StepBasicData({
  register,
  errors,
  selectedSizes,
  onToggleSize,
  categories,
}: StepBasicDataProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            {...register("title")}
            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-gray-900 transition"
            placeholder="Ej: Remera Negra"
          />
          {errors.title && (
            <span className="text-red-500 text-xs">{errors.title.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio ($) *
          </label>
          <input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-gray-900 transition"
          />
          {errors.price && (
            <span className="text-red-500 text-xs">{errors.price.message}</span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción *
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-gray-900 transition"
          placeholder="Describe el producto..."
        />
        {errors.description && (
          <span className="text-red-500 text-xs">
            {errors.description.message}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select
            {...register("categoryId")}
            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-gray-900 transition"
          >
            <option value="">Selecciona...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <span className="text-red-500 text-xs">
              {errors.categoryId.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Género *
          </label>
          <select
            {...register("gender")}
            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-gray-900 transition"
          >
            <option value="">Selecciona...</option>
            {ALL_GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {errors.gender && (
            <span className="text-red-500 text-xs">
              {errors.gender.message}
            </span>
          )}
        </div>
      </div>

      {/* Tallas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tallas *
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => onToggleSize(size)}
                className={`px-4 py-2 text-sm border-2 font-medium rounded-lg transition ${
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
          <span className="text-red-500 text-xs">{errors.sizes.message}</span>
        )}
      </div>
    </div>
  );
}
