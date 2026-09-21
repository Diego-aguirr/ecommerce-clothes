import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "../../../../../auth";

export async function POST() {
  // 1️⃣ Usuario autenticado
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // 2️⃣ Obtener usuario real desde DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  // 3️⃣ Verificar email (sin grace period)
  if (!user.emailVerified) {
    return NextResponse.json(
      {
        error: "EMAIL_VERIFICATION_REQUIRED",
        message: "Debes verificar tu email para continuar con la compra.",
      },
      { status: 403 },
    );
  }

  // 4️⃣ Checkout permitido (continúa flujo normal)
  return NextResponse.json({
    ok: true,
  });
}
