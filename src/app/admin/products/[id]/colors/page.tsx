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
          className="text-sm text-muted-foreground hover:text-foreground transition font-medium"
        >
          ← Volver al Producto
        </Link>
        <span className="text-muted-foreground">|</span>
        <h1 className="text-2xl font-bold text-foreground">
          Colores: <span className="text-muted-foreground font-medium">{product.title}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Formulario para crear color */}
        <div className="lg:col-span-1">
          <div className="bg-background rounded-2xl shadow-sm border border-border p-6 sticky top-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Nuevo Color</h2>
            <ColorForm productId={id} />
          </div>
        </div>

        {/* Columna derecha: Lista de colores */}
        <div className="lg:col-span-2">
          <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-bold text-foreground">
                Colores Existentes ({colors.length})
              </h2>
              <Link
                href={`/admin/products/${id}/variants`}
                className="text-sm text-primary font-medium"
              >
                ← Gestionar Variantes
              </Link>
            </div>

            <div className="divide-y divide-border">
              {colors.map((color) => (
                <div key={color.id} className="p-6 hover:bg-muted transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Color swatch */}
                      {color.hexCode ? (
                        <span
                          className="w-12 h-12 rounded-lg border border-border shadow-sm"
                          style={{ backgroundColor: color.hexCode }}
                        />
                      ) : (
                        <span className="w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center text-muted-foreground text-xs">
          Sin color
                        </span>
                      )}

                      <div>
                        <h3 className="font-semibold text-foreground">{color.label}</h3>
                        <p className="text-sm text-muted-foreground">Técnico: {color.color}</p>
                        <p className="text-xs text-muted-foreground mt-1">
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
                      <p className="text-xs font-medium text-muted-foreground mb-2">Imágenes:</p>
                      <div className="flex gap-2 flex-wrap">
                        {color.images.map((img, idx) => (
                          <div key={img.id} className="relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={`${color.label} ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-border"
                            />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-foreground text-background text-xs rounded-full flex items-center justify-center">
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview de cómo se ve en la tienda */}
                  <div className="mt-4 pl-16 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Vista en tienda: Selector de color mostrará &quot;{color.label}&quot; con este color
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {colors.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground text-sm font-medium">No hay colores creados aún.</p>
                <p className="text-muted-foreground text-xs mt-2">
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
