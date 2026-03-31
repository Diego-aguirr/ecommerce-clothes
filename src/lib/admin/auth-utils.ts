import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/"); // Or better, redirect to a not-authorized page
  }
  return session.user;
}

export async function requireSuperAdmin() {
  const session = await auth();
  // Casting for type safety since we know the field is there
  const user = session?.user as any;
  if (!user || user.role !== "admin" || !user.isSuperAdmin) {
    redirect("/");
  }
  return user;
}
