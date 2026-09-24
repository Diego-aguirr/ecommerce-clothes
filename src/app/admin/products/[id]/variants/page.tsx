import { requireAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toggleVariantStatus } from "@/actions/admin/variants";
import { VariantForm } from "./ui/VariantForm";

export const metadata = { title: "Admin | Variantes de Producto" };

type Props = { params: Promise<{ id: string }> };

export default async function ProductVariantsPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [product, variants, colors] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true, sizes: true },
    }),
    prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: [{ color: "asc" }, { size: "asc" }],
    }),
    prisma.productColor.findMany({
      where: { productId: id },
      orderBy: { label: "asc" },
    }),
  ]);

  if (!product) notFound();

  async function toggle(variantId: string, nextActive: boolean): Promise<void> {
    "use server";
    await toggleVariantStatus({ variantId, isActive: nextActive });
  }

  // Agrupar variantes por color para mostrar
  const variantsByColor = colors.map((color) => ({
    ...color,
    variants: variants.filter((v) => v.color === color.color),
  }));

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
          Variantes: <span className="text-muted-foreground font-medium">{product.title}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Formulario para crear variante */}
        <div className="lg:col-span-1">
          <div className="bg-background rounded-2xl shadow-sm border border-border p-6 sticky top-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Nueva Variante</h2>
            <VariantForm 
              productId={id} 
              existingColors={colors} 
              availableSizes={product.sizes}
              existingVariants={variants}
            />
          </div>
        </div>

        {/* Columna derecha: Tabla de variantes */}
        <div className="lg:col-span-2">
          <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-bold text-foreground">
                Variantes Existentes ({variants.length})
              </h2>
              <Link
                href={`/admin/products/${id}/colors`}
                className="text-sm text-primary font-medium"
              >
                Gestionar Colores →
              </Link>
            </div>

            {variantsByColor.map((colorGroup) => (
              <div key={colorGroup.color} className="border-b border-border last:border-0">
                <div className="px-6 py-3 bg-muted flex items-center gap-3">
                  {colorGroup.hexCode && (
                    <span
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: colorGroup.hexCode }}
                    />
                  )}
                  <h3 className="font-semibold text-foreground">{colorGroup.label}</h3>
                  <span className="text-xs text-muted-foreground">({colorGroup.variants.length} variantes)</span>
                </div>

                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th scope="col" className="px-6 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">SKU</th>
                      <th scope="col" className="px-6 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">Talla</th>
                      <th scope="col" className="px-6 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">Stock</th>
                      <th scope="col" className="px-6 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">Estado</th>
                      <th scope="col" className="px-6 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {colorGroup.variants.map((variant) => (
                      <tr key={variant.id} className="hover:bg-muted transition-colors">
                        <td className="px-6 py-3 text-sm font-medium text-foreground">{variant.sku}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{variant.size}</td>
                        <td className="px-6 py-3">
                          <span className={`text-sm font-semibold ${variant.stock === 0 ? 'text-red-600' : variant.stock < 5 ? 'text-orange-600' : 'text-green-600'}`}>
                            {variant.stock} uds.
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${variant.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {variant.isActive ? "Activa" : "Inactiva"}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3 text-sm">
                            <Link
                              href={`/admin/products/${id}/variants/${variant.id}/edit`}
                              className="text-primary font-medium"
                            >
                              Editar
                            </Link>
                            <form action={toggle.bind(null, variant.id, !variant.isActive)}>
                              <button
                                type="submit"
                                className={`cursor-pointer transition ${variant.isActive ? "text-red-500 hover:text-red-700" : "text-green-600 hover:text-green-800"}`}
                              >
                                {variant.isActive ? "Desactivar" : "Activar"}
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {colorGroup.variants.length === 0 && (
                  <div className="px-6 py-4 text-sm text-muted-foreground">
                    No hay variantes para este color
                  </div>
                )}
              </div>
            ))}

            {variants.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground text-sm font-medium">No hay variantes creadas aún.</p>
                <p className="text-muted-foreground text-xs mt-2">Usa el formulario de la izquierda para crear la primera.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
