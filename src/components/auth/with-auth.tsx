"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Higher-order component to protect client components
 * Will redirect to login if user is not authenticated
 */
export function withAuth<P extends object>(
    Component: React.ComponentType<P>
): React.FC<P> {
    return function ProtectedComponent(props: P) {
        const { status } = useSession();
        const router = useRouter();

        useEffect(() => {
            if (status === "unauthenticated") {
                router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            }
        }, [status, router]);

        if (status === "loading") {
            return (
                <div className="flex h-screen items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <span className="ml-2">Loading...</span>
                </div>
            );
        }

        if (status === "authenticated") {
            return <Component {...props} />;
        }

        return null;
    };
}