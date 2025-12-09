"use client";

import { titleFont } from "@/config/fonts";

// import { getStockBySlug } from "@/actions"; // Funcionalidad externa
// import { titleFont } from "@/config/fonts"; // Funcionalidad externa
// import { useEffect, useState } from "react"; // Funcionalidad externa

interface Props {
  slug: string;
}

export const StockLabel = ({ slug }: Props) => {
  // const [stock, setStock] = useState(0); // Funcionalidad externa
  // const [isLoading, setIsLoading] = useState(true); // Funcionalidad externa

  // useEffect(() => { // Funcionalidad externa
  //   const getStock = async () => {
  //     const inStock = await getStockBySlug(slug);
  //     setStock(inStock);
  //     setIsLoading(false);
  //   };

  // }, [slug]);

  return (
    <>
      {/* {isLoading ? ( // Funcionalidad externa
        <h1
          className={` ${titleFont.className} antialiased font-bold text-lg bg-gray-200 animate-pulse `}
        >
          &nbsp;
        </h1>
      ) : (
        <h1 className={` ${titleFont.className} antialiased font-bold text-lg`}>
          Stock: {stock}
        </h1>
      )} */}
      <h1
        className={` /* ${titleFont.className} */ antialiased font-bold text-lg`}
      >
        Stock: 7{slug}
      </h1>
    </>
  );
};
