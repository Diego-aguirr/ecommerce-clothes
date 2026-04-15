"use server";

import { signIn } from "../../../auth";

function isLocalUrl(url: string): boolean {
  // Only allow local paths starting with /, not // or external URLs
  return url.startsWith("/") && !url.startsWith("//");
}

export async function signInWithGoogle(callbackUrl?: string) {
  // Validate to prevent open redirect attacks
  const target = isLocalUrl(callbackUrl || "") ? callbackUrl : "/";

  await signIn("google", {
    redirectTo: target,
    redirect: true,
  });
}