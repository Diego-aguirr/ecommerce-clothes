import { getPaginatedProductsWithImages } from "@/actions";
import { Title } from "@/components";
import { ProductGrid } from "@/components/products/product-grid/ProductGrid";

export default async function ShopPage() {
  const { products } = await getPaginatedProductsWithImages();

  return (
    <>
      <Title title="Tienda" subtitle="Todos los productos" className="mb-2" />

      <ProductGrid products={products} />
    </>
  );
}
