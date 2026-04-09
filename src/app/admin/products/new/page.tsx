import { requireAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ProductForm } from "../../components/products/product-form";

export const metadata = { title: "Admin | Nuevo Producto" };

export default async function NewProductPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

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
          Crear nuevo producto
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
