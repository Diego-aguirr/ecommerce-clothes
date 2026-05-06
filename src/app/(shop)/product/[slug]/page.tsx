export const revalidate = 604800;

import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";

import { titleFont } from "@/config/fonts";
import { StockLabel } from "@/components";
import { getProductBySlug } from "@/actions";
import { ProductPageClient } from "./ui/ProductPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return {
    title: product?.title ?? "Producto no encontrado",
    description: product?.description ?? "",
    openGraph: {
      title: product?.title ?? "Producto no encontrado",
      description: product?.description ?? "",
      images: product?.images && product.images.length > 1 
        ? [`/products/${product.images[1]}`]
        : product?.images && product.images.length > 0
        ? [`/products/${product.images[0]}`]
        : [],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) notFound();

  // ✅ Producto ya viene con variantsByColor desde getProductBySlug
  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-10">
      <ProductPageClient 
        product={product}
        titleFont={titleFont}
      />
    </main>
  );
}
