import type { Metadata } from "next";
import { inter } from "@/config/fonts";
import "./globals.css";
import { Provider } from "@/components";

export const metadata: Metadata = {
  title: {
    default: "SAURON - Tienda Oficial",
    template: "%s - SAURON",
  },
  description:
    "La mejor tienda de ropa con diseños únicos. Explora la colección de SAURON.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased text-gray-900 bg-white`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
