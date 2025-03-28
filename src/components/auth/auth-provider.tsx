"use client";

import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";

/**
 * Authentication provider that wraps the application to provide session context
 */
export function AuthProvider({ children }: PropsWithChildren) {
    return <SessionProvider>{children}</SessionProvider>;
}