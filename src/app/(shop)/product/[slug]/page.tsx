export const revalidate = 604800;

import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";

import { titleFont } from "@/config/fonts";
import { StockLabel } from "@/components";
import { getProductBySlug } from "@/actions";
import ProductSlideshow, {
  ProductThumbnails,
  ProductMainImage,
} from "@/components/product/slideshow/ProductSlideshow";
import ProductMobileSlideshow from "@/components/product/slideshow/ProductMobileSlideshow";
import { AddToCart } from "./ui/AddToCart";

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
      images: [`/products/${product?.images[1]}`],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-10">
      {/* ── DESKTOP: 3 columnas ── */}
      <ProductSlideshow
        images={product.images}
        title={product.title}
        className="hidden md:grid md:grid-cols-[72px_1fr_380px] lg:grid-cols-[80px_1fr_420px] gap-6 lg:gap-12"
      >
        {/* Col 1 — Miniaturas verticales */}
        <ProductThumbnails />

        {/* Col 2 — Imagen principal */}
        <ProductMainImage />

        {/* Col 3 — Info y compra */}
        <div className="flex flex-col gap-6 py-2">
          <div>
            <StockLabel slug={product.slug} />
            <h1
              className={`${titleFont.className} antialiased font-bold text-2xl lg:text-3xl text-gray-900 leading-tight mt-2`}
            >
              {product.title}
            </h1>
            <p className="text-4xl font-light text-gray-900 mt-4 tracking-tight">
              ${product.price.toLocaleString("es-AR")}
            </p>
          </div>

          <AddToCart product={product} />

          {/* Descripción */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Descripción
            </h3>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              {product.description}
            </p>
          </div>
        </div>
      </ProductSlideshow>

      {/* ── MOBILE: stack ── */}
      <div className="md:hidden flex flex-col gap-6">
        <ProductMobileSlideshow title={product.title} images={product.images} />

        <div className="flex flex-col gap-6 px-1">
          <div>
            <StockLabel slug={product.slug} />
            <h1
              className={`${titleFont.className} antialiased font-bold text-2xl text-gray-900 leading-tight mt-2`}
            >
              {product.title}
            </h1>
            <p className="text-3xl font-light text-gray-900 mt-3">
              ${product.price.toLocaleString("es-AR")}
            </p>
          </div>

          <AddToCart product={product} />

          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Descripción
            </h3>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
