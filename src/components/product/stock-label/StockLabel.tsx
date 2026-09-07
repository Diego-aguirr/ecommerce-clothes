import { getStockBySlug } from "@/actions/product/get-stock-by-slug";
import { titleFont } from "@/config/fonts";

interface Props {
  slug: string;
}

export async function StockLabel({ slug }: Props) {
  const stock = await getStockBySlug(slug);

  return (
    <h1 className={`${titleFont.className} antialiased font-bold text-lg`}>
      Stock: {stock}
    </h1>
  );
}
