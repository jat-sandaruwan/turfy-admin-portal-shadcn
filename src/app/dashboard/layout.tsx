import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children
}: {
    children: React.ReactNode;
}) {
    // Get the session from the server
    const session = await getServerSession(authOptions);

    console.log("Dashboard session check:", {
        sessionExists: !!session,
        userId: session?.user?.id,
        userRole: session?.user?.role
    });

    // If not authenticated, redirect to login
    if (!session || !session.user) {
        console.log("No session found, redirecting to login");
        redirect("/login?callbackUrl=/dashboard");
    }

    // Ensure user is an admin
    if (session.user.role !== "admin") {
        console.log("User is not an admin, redirecting to login");
        redirect("/login?error=AccessDenied");
    }
    
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}