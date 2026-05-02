import { redirect } from "next/navigation";
import { auth } from "../../../auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log("AuthLayout session:", session);
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md px-8 py-10 bg-white shadow-xl sm:rounded-xl">
        <div className="flex flex-col items-center mb-8">
          {/* Aquí puedes usar un <Image> de Next.js para tu Logo si tenés uno */}
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {process.env.NEXT_PUBLIC_APP_NAME || "Satoru Store"}
          </h2>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Ingresá a tu cuenta o registrate para continuar con tus compras
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
