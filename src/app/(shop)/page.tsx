import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio | Satoru Store",
  description:
    "Descubrí tu estilo con las últimas tendencias y llegadas exclusivas de temporada. Envíos a todo el país.",
  openGraph: {
    title: "Satoru Store",
    description: "Descubrí tu estilo con las últimas tendencias de temporada.",
    type: "website",
  },
};

export const revalidate = 60;
import { getPaginatedProductsWithImages } from "@/actions/product/product-pagination";
import { Pagination, Title } from "@/components";
import { ProductGrid } from "@/components/products/product-grid/ProductGrid";

interface Props {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const { products, totalPages } =
    await getPaginatedProductsWithImages({ page });

  return (
    <div className="px-4 sm:px-0">
      <Title
        title="Descubrí tu estilo"
        subtitle="Explorá las últimas tendencias y llegadas exclusivas de temporada."
        className="mb-10"
      />

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No se encontraron productos.</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}

      <Pagination totalPages={totalPages} />
    </div>
  );
}
