import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex justify-center items-center min-h-screen bg-muted">
      <div className="w-full max-w-md px-8 py-10 bg-background shadow-xl sm:rounded-xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a {process.env.NEXT_PUBLIC_APP_NAME || "Satoru Store"}
        </Link>
        <div className="flex flex-col items-center mb-8">
          {/* Aquí puedes usar un <Image> de Next.js para tu Logo si tenés uno */}
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {process.env.NEXT_PUBLIC_APP_NAME || "Satoru Store"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Ingresá a tu cuenta o registrate para continuar con tus compras
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
