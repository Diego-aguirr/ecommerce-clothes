import { Footer, Sidebar, TopMenu, WhatsappButton, AnnouncementBar } from "@/components";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <AnnouncementBar />
      <TopMenu />
      <Sidebar />

      <div className="px-0 sm:px-10">{children}</div>

      <Footer />

      {/* ── WhatsApp Global Button ── */}
      <WhatsappButton />
    </main>
  );
}
