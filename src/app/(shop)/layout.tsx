import { Footer, Sidebar, TopMenu, WhatsappButton } from "@/components";
import { auth } from "../../../auth";
import { getEmailVerificationStatus } from "@/lib/email-verification";
import prisma from "@/lib/prisma";
import EmailBanner from "@/components/ui/verification/EmailBanner";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let verificationStatus = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user) {
      verificationStatus = getEmailVerificationStatus(user);
    }
  }

  return (
    <main className="min-h-screen">
      <TopMenu />
      <Sidebar />

      {verificationStatus && verificationStatus.reason !== "VERIFIED" && (
        <EmailBanner
          reason={
            verificationStatus.reason as
              | "GRACE_PERIOD"
              | "EMAIL_VERIFICATION_REQUIRED"
          }
        />
      )}

      <div className="px-0 sm:px-10">{children}</div>

      <Footer />
      
      {/* ── WhatsApp Global Button ── */}
      <WhatsappButton />
    </main>
  );
}
