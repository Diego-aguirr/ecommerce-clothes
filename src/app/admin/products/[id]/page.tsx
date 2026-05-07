import { requireAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/admin/products/product-form";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { title: true } });
  return { title: `Admin | Editar: ${product?.title ?? "Producto"}` };
}

export default async function EditProductPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories, variantCount, colorCount] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { ProductImage: true, category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.productVariant.count({ where: { productId: id } }),
    prisma.productColor.count({ where: { productId: id } }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/products"
          className="text-sm text-gray-500 hover:text-gray-900 transition font-medium"
        >
          ← Volver a Productos
        </Link>
        <span className="text-gray-300">|</span>
        <h1 className="text-2xl font-bold text-gray-900">
          Editar: <span className="text-gray-500 font-medium">{product.title}</span>
        </h1>
      </div>

      {/* Links a gestión de variantes y colores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href={`/admin/products/${id}/variants`}
          className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
              📦
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                Gestionar Variantes
              </h3>
              <p className="text-sm text-gray-500">{variantCount} variantes creadas</p>
            </div>
          </div>
          <span className="text-gray-400 group-hover:text-indigo-600 transition">→</span>
        </Link>

        <Link
          href={`/admin/products/${id}/colors`}
          className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center text-lg">
              🎨
            </span>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition">
                Gestionar Colores
              </h3>
              <p className="text-sm text-gray-500">{colorCount} colores creados</p>
            </div>
          </div>
          <span className="text-gray-400 group-hover:text-pink-600 transition">→</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <ProductForm categories={categories} product={product as any} />
      </div>
    </div>
  );
}
