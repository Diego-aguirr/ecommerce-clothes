import { requireAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ProductWizard } from "@/components/admin/products/product-wizard";

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
          className="text-sm text-muted-foreground hover:text-foreground transition font-medium"
        >
          ← Volver a Productos
        </Link>
        <span className="text-muted-foreground">|</span>
        <h1 className="text-2xl font-bold text-foreground">
          Crear nuevo producto
        </h1>
      </div>

      <ProductWizard categories={categories} />
    </div>
  );
}
