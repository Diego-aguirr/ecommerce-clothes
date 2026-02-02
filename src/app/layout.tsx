import type { Metadata } from "next";
import { inter } from "@/config/fonts";

import "./globals.css"; // Re-adding the missing import
import { Provider } from "@/components";

export const metadata: Metadata = {
  title: {
    default: "JAVA CREW - Tienda Oficial",
    template: "%s - JAVA CREW",
  },
  description:
    "La mejor tienda de ropa con diseños únicos. Explora la colección de JAVA CREW.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
