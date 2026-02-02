// app/api/auth/resend-verification/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { auth } from "../../../../../auth";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";

export async function POST() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // No revelar estado
  if (!user || user.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  // 1️⃣ Invalidar tokens anteriores
  await prisma.verificationToken.deleteMany({
    where: { identifier: user.email },
  });

  // 2️⃣ Crear nuevo token
  const token = crypto.randomUUID();

  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  // 3️⃣ 🔥 ENVIAR EMAIL REAL
  await sendVerificationEmail(user.email, token);

  return NextResponse.json({ ok: true });
}
