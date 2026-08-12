export const revalidate = 60;
import { getPaginatedProductsWithImages } from "@/actions";
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
    <>
      <Title 
        title="Descubrí tu estilo" 
        subtitle="Explorá las últimas tendencias y llegadas exclusivas de temporada." 
        className="mb-8" 
      />

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No se encontraron productos.</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}

      <Pagination totalPages={totalPages} />
    </>
  );
}
