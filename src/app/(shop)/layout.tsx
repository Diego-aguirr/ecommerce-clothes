import { Footer, Sidebar, TopMenu, WhatsappButton, AnnouncementBar } from "@/components";
import { auth } from "../../../auth";
import prisma from "@/lib/prisma";
import EmailBanner from "@/components/ui/verification/EmailBanner";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let needsVerification = false;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user && !user.emailVerified) {
      needsVerification = true;
    }
  }

  return (
    <main className="min-h-screen">
      <AnnouncementBar />
      <TopMenu />
      <Sidebar />

      {needsVerification && (
        <EmailBanner reason="EMAIL_VERIFICATION_REQUIRED" />
      )}

      <div className="px-0 sm:px-10">{children}</div>

      <Footer />
      
      {/* ── WhatsApp Global Button ── */}
      <WhatsappButton />
    </main>
  );
}
