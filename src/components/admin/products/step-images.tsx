"use client";

import { useState } from "react";
import { uploadProductImage, removeProductImage } from "@/actions/admin/upload";
import { FiX, FiImage } from "react-icons/fi";

type ImageEntry = { url: string; publicId: string };

type StepImagesProps = {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
};

export function StepImages({ images, onChange }: StepImagesProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadProductImage(fd);

    if (result.ok && result.url && result.publicId) {
      onChange([...images, { url: result.url, publicId: result.publicId }]);
    }
    setUploading(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    }
  };

  const removeImage = async (publicId: string) => {
    onChange(images.filter((img) => img.publicId !== publicId));
    await removeProductImage(publicId);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {images.length} imagen{images.length !== 1 && "es"} — La primera será
          la principal
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-border"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Subiendo...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FiImage size={32} className="text-border" />
            <p className="text-sm text-muted-foreground">
              Arrastrá una imagen aquí o{" "}
              <label className="text-primary font-medium cursor-pointer">
                seleccioná un archivo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </label>
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG hasta 5MB</p>
          </div>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.publicId}
              className="relative group aspect-square rounded-lg border border-border overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url.startsWith("http") ? img.url : `/products/${img.url}`}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-1">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx - 1)}
                      className="w-7 h-7 bg-background/90 rounded-full flex items-center justify-center text-foreground hover:bg-card text-xs font-bold"
                    >
                      ←
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.publicId)}
                    className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <FiX size={14} />
                  </button>
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx + 1)}
                      className="w-7 h-7 bg-background/90 rounded-full flex items-center justify-center text-foreground hover:bg-card text-xs font-bold"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>

              {/* Badge */}
              {idx === 0 && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-foreground text-white text-[10px] font-bold rounded">
                  Principal
                </span>
              )}
              <span className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white text-xs rounded-full flex items-center justify-center">
                {idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-center text-red-500 text-sm">
          Subí al menos una imagen para continuar.
        </p>
      )}
    </div>
  );
}
