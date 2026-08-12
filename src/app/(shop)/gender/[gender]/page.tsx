export const revalidate = 60;

import { getPaginatedProductsWithImages } from "@/actions";
import { Pagination, ProductGrid, Title } from "@/components";
import { Gender } from "@/generated/prisma/enums";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: Promise<{
    gender: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function Page({ params, searchParams }: Props) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const { gender } = resolvedParams;

  // Validación estricta: Si escriben "fruta", mandarlos a 404 para evitar que Prisma crashee
  const validGenders = ['men', 'women', 'kid', 'unisex', 'outfits'];
  if (!validGenders.includes(gender)) {
    notFound();
  }

  const page = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page)
    : 1;

  const { products, totalPages } =
    await getPaginatedProductsWithImages({
      page,
      gender: gender as Gender,
    });

  // Si la página pedida excede el total, volver a la primera página de esta categoría
  if (products.length === 0 && page > 1) {
    redirect(`/gender/${gender}`);
  }

  const labels: Record<string, string> = {
    men: "para hombres",
    women: "para mujeres",
    kid: "para niños",
    unisex: "para todos",
    outfits: "Cápsula / Combos Completos",
  };

  const subtitle = labels[gender] ? `Artículos ${labels[gender]}` : "Artículos";

  return (
    <>
      <Title title={subtitle} subtitle="Todos los productos" className="mb-2" />

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-6xl mb-4">🛍️</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Próximamente
          </h2>
          <p className="text-gray-500 max-w-md">
            Estamos preparando productos increíbles para esta sección. ¡Volvé pronto!
          </p>
        </div>
      ) : (
        <>
          <ProductGrid products={products} />
          <Pagination totalPages={totalPages} />
        </>
      )}
    </>
  );
}
