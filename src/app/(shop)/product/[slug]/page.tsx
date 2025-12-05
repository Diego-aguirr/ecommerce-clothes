import { notFound } from "next/navigation";

import { initialData } from "@/seed/seed";
import { titleFont } from "@/config/fonts";
import { QuantitySelector, SizeSelector } from "@/components";
import ProductSlideshow from "@/components/product/slideshow/ProductSlideshow";
import { Size } from "@/interfaces";
/* import {
  ProductMobileSlideshow,
  ProductSlideshow,
  QuantitySelector,
  SizeSelector,
} from "@/components"; */

interface Props {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params; // 👈 importante

  const product = initialData.products.find((p) => p.slug === slug);

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
        <h1 className={`${titleFont.className} antialiased font-bold text-xl`}>
          {product.title}
        </h1>
        <p className="text-lg mb-5">${product.price}</p>

        <SizeSelector
          selectedSize={product.sizes[0]}
          availableSizes={product.sizes}
          onSizeChanged={function (size: Size): void {
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
