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
          className="text-sm text-gray-500 hover:text-gray-900 transition font-medium"
        >
          ← Volver al Producto
        </Link>
        <span className="text-gray-300">|</span>
        <h1 className="text-2xl font-bold text-gray-900">
          Variantes: <span className="text-gray-500 font-medium">{product.title}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Formulario para crear variante */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Nueva Variante</h2>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Variantes Existentes ({variants.length})
              </h2>
              <Link
                href={`/admin/products/${id}/colors`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Gestionar Colores →
              </Link>
            </div>

            {variantsByColor.map((colorGroup) => (
              <div key={colorGroup.color} className="border-b border-gray-100 last:border-0">
                <div className="px-6 py-3 bg-gray-50 flex items-center gap-3">
                  {colorGroup.hexCode && (
                    <span
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: colorGroup.hexCode }}
                    />
                  )}
                  <h3 className="font-semibold text-gray-700">{colorGroup.label}</h3>
                  <span className="text-xs text-gray-400">({colorGroup.variants.length} variantes)</span>
                </div>

                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th scope="col" className="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                      <th scope="col" className="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Talla</th>
                      <th scope="col" className="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                      <th scope="col" className="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                      <th scope="col" className="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {colorGroup.variants.map((variant) => (
                      <tr key={variant.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{variant.sku}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{variant.size}</td>
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
                              className="text-blue-600 hover:text-blue-800 font-medium"
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
                  <div className="px-6 py-4 text-sm text-gray-400">
                    No hay variantes para este color
                  </div>
                )}
              </div>
            ))}

            {variants.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-sm font-medium">No hay variantes creadas aún.</p>
                <p className="text-gray-400 text-xs mt-2">Usa el formulario de la izquierda para crear la primera.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
