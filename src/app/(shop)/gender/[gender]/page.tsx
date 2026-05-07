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
  const validGenders = ['men', 'women', 'kid', 'unisex'];
  if (!validGenders.includes(gender)) {
    notFound();
  }

  const page = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page)
    : 1;

  const { products, currentPage, totalPages } =
    await getPaginatedProductsWithImages({
      page,
      gender: gender as Gender,
    });

  // Si no hay productos (ej. página 100 vacía o categoría vacía), redirigir al home en lugar de a sí mismo (evita loop infinito)
  if (products.length === 0 && page > 1) {
    redirect(`/gender/${gender}`);
  } else if (products.length === 0) {
    redirect(`/`);
  }

  const labels: Record<string, string> = {
    men: "para hombres",
    women: "para mujeres",
    kid: "para niños",
    unisex: "para todos",
  };

  const subtitle = labels[gender] ? `Artículos ${labels[gender]}` : "Artículos";

  return (
    <>
      <Title title={subtitle} subtitle="Todos los productos" className="mb-2" />

      <ProductGrid products={products} />
      <Pagination totalPages={totalPages} />
    </>
  );
}
