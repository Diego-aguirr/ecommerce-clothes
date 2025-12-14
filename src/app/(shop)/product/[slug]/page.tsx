export const revalidate = 604800; // Disable caching for this page
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";

import { titleFont } from "@/config/fonts";
import { QuantitySelector, SizeSelector, StockLabel } from "@/components";
import ProductSlideshow from "@/components/product/slideshow/ProductSlideshow";
import { getProductBySlug } from "@/actions";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;

  // fetch post information
  const product = await getProductBySlug(slug);

  return {
    title: product?.title ?? "Producto no encontrado",
    description:
      product?.description ??
      "No se pudo encontrar la descripción del producto.",
    openGraph: {
      title: product?.title ?? "Producto no encontrado",
      description:
        product?.description ??
        "No se pudo encontrar la descripción del producto.",
      //aqui debe ir el url Original de produccion
      images: [`/products/${product?.images[1]}`],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = params; // 👈 importante

  const product = await getProductBySlug(slug);
  console.log("Product fetched in page:", product);

  if (!product) {
    notFound();
  }

  return (
    <div className="mt-5 mb-20 grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Slideshow */}
      <div className="col-span-1 md:col-span-2">
        <ProductSlideshow title={product.title} images={product.images} />
      </div>

      {/* Detalles */}
      <div className="col-span-1 px-5">
        <StockLabel slug={product.slug} />

        <h1 className={`${titleFont.className} antialiased font-bold text-xl`}>
          {product.title}
        </h1>
        <p className="text-lg mb-5">${product.price}</p>

        <SizeSelector
          selectedSize={product.sizes[0]}
          availableSizes={product.sizes}
          onSizeChanged={function (): void {
            throw new Error("Function n: ot implemented.");
          }}
        />
        <QuantitySelector quantity={2} />

        <button className="btn-primary my-5">Agregar al carrito</button>

        <h3 className="font-bold text-sm">Descripción</h3>
        <p className="font-light">{product.description}</p>
      </div>
    </div>
  );
}
