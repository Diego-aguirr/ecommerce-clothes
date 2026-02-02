"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
interface Props {
  children: React.ReactNode;
}

export const Provider = ({ children }: Props) => {
  return <SessionProvider>{children}</SessionProvider>;
};
