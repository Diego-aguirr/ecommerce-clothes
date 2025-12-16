export const revalidate = 604800; // 7 days

import { notFound } from "next/navigation";

import { titleFont } from "@/config/fonts";
import { QuantitySelector, SizeSelector, StockLabel } from "@/components";
import { getProductBySlug } from "@/actions";
import ProductSlideshow from "@/components/product/slideshow/ProductSlideshow";
import { Metadata, ResolvingMetadata } from "next";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const slug = params.slug;

  // fetch data
  const product = await getProductBySlug(slug);

  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || []

  return {
    title: product?.title ?? "Producto no encontrado",
    description: product?.description ?? "",
    openGraph: {
      title: product?.title ?? "Producto no encontrado",
      description: product?.description ?? "",
      // images: [], // https://misitioweb.com/products/image.png
      images: [`/products/${product?.images[1]}`],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = params; // 👈 importante

  const product = await getProductBySlug(slug);
  console.log("Product slug page:", product);
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
            throw new Error("Function not implemented.");
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
