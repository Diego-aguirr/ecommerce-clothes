export const revalidate = 604800;

import { notFound } from "next/navigation";
import { Metadata } from "next";

import { titleFont } from "@/config/fonts";
import { getProductBySlug } from "@/actions/product/get-product-by-slug";
import { ProductPageClient } from "./ui/ProductPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return {
    title: product?.title ?? "Producto no encontrado",
    description: product?.description ?? "",
    openGraph: {
      title: product?.title ?? "Producto no encontrado",
      description: product?.description ?? "",
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://shop.builtbyaguirre.com"}/product/${slug}`,
      type: "website",
      siteName: "Built by Aguirre",
      images: product?.images && product.images.length > 1 
        ? [product.images[1].startsWith('http') ? product.images[1] : `/products/${product.images[1]}`]
        : product?.images && product.images.length > 0
        ? [product.images[0].startsWith('http') ? product.images[0] : `/products/${product.images[0]}`]
        : [],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://shop.builtbyaguirre.com";
  const productUrl = `${baseUrl}/product/${slug}`;

  // ✅ Producto ya viene con variantsByColor desde getProductBySlug
  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-10">
      <ProductPageClient 
        product={product}
        titleFont={titleFont}
        productUrl={productUrl}
      />
    </main>
  );
}
