import { requireAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteColor } from "@/actions/admin/colors";
import { ColorForm } from "./ui/ColorForm";

export const metadata = { title: "Admin | Colores de Producto" };

type Props = { params: Promise<{ id: string }> };

export default async function ProductColorsPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [product, colors] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true },
    }),
    prisma.productColor.findMany({
      where: { productId: id },
      include: {
        images: { orderBy: { order: "asc" } },
        _count: { select: { images: true } },
      },
      orderBy: { label: "asc" },
    }),
  ]);

  if (!product) notFound();

  async function remove(colorId: string): Promise<void> {
    "use server";
    await deleteColor(colorId, id);
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/products/${id}`}
          className="text-sm text-gray-500 hover:text-gray-900 transition font-medium"
        >
          ← Volver al Producto
        </Link>
        <span className="text-gray-300">|</span>
        <h1 className="text-2xl font-bold text-gray-900">
          Colores: <span className="text-gray-500 font-medium">{product.title}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Formulario para crear color */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Nuevo Color</h2>
            <ColorForm productId={id} />
          </div>
        </div>

        {/* Columna derecha: Lista de colores */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Colores Existentes ({colors.length})
              </h2>
              <Link
                href={`/admin/products/${id}/variants`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Gestionar Variantes
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {colors.map((color) => (
                <div key={color.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Color swatch */}
                      {color.hexCode ? (
                        <span
                          className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm"
                          style={{ backgroundColor: color.hexCode }}
                        />
                      ) : (
                        <span className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
          Sin color
                        </span>
                      )}

                      <div>
                        <h3 className="font-semibold text-gray-900">{color.label}</h3>
                        <p className="text-sm text-gray-500">Técnico: {color.color}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {color._count.images} imágenes
                        </p>
                      </div>
                    </div>

                    <form action={remove.bind(null, color.id)}>
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                        title="Eliminar color"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>

                  {/* Imágenes del color */}
                  {color.images.length > 0 && (
                    <div className="mt-4 pl-16">
                      <p className="text-xs font-medium text-gray-500 mb-2">Imágenes:</p>
                      <div className="flex gap-2 flex-wrap">
                        {color.images.map((img, idx) => (
                          <div key={img.id} className="relative group">
                            <img
                              src={img.url}
                              alt={`${color.label} ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center">
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview de cómo se ve en la tienda */}
                  <div className="mt-4 pl-16 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Vista en tienda: Selector de color mostrará "{color.label}" con este color
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {colors.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-sm font-medium">No hay colores creados aún.</p>
                <p className="text-gray-400 text-xs mt-2">
                  Usa el formulario de la izquierda para crear el primero.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
