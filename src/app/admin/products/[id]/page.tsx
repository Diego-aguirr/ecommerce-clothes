import { requireAdmin } from "@/lib/admin/auth-utils";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditProductForm } from "./edit-product-form";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { title: true } });
  return { title: `Admin | Editar: ${product?.title ?? "Producto"}` };
}

export default async function EditProductPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories, colors, variants] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { ProductImage: true, category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.productColor.findMany({
      where: { productId: id },
      include: { images: { orderBy: { order: "asc" } } },
      orderBy: { label: "asc" },
    }),
    prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: [{ color: "asc" }, { size: "asc" }],
    }),
  ]);

  if (!product) notFound();

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
          Editar: <span className="text-muted-foreground font-medium">{product.title}</span>
        </h1>
      </div>

      <EditProductForm
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          sizes: product.sizes,
          tags: product.tags,
          gender: product.gender,
          categoryId: product.categoryId,
          ProductImage: product.ProductImage,
        }}
        categories={categories}
        existingColors={colors.map((c) => ({
          id: c.id,
          color: c.color,
          label: c.label,
          hexCode: c.hexCode,
          images: c.images,
        }))}
        existingVariants={variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock: v.stock,
          isActive: v.isActive,
        }))}
      />
    </div>
  );
}
