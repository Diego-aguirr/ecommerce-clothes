"use client";

import { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast/toast-provider";

export function AdminProviders({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
