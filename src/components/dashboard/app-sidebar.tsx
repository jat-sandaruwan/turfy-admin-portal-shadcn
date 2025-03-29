"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import { NavDocuments } from "@/components/dashboard/nav-documents"
import { NavMain } from "@/components/dashboard/nav-main"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
import { NavUser } from "@/components/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Lifecycle",
      url: "/dashboard/lifecycle",
      icon: IconListDetails,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "/dashboard/capture",
      items: [
        {
          title: "Active Proposals",
          url: "/dashboard/capture/active",
        },
        {
          title: "Archived",
          url: "/dashboard/capture/archived",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "/dashboard/proposal",
      items: [
        {
          title: "Active Proposals",
          url: "/dashboard/proposal/active",
        },
        {
          title: "Archived",
          url: "/dashboard/proposal/archived",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "/dashboard/prompts",
      items: [
        {
          title: "Active Proposals",
          url: "/dashboard/prompts/active",
        },
        {
          title: "Archived",
          url: "/dashboard/prompts/archived",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/dashboard/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/dashboard/search",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "/dashboard/data-library",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "/dashboard/reports",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "/dashboard/word-assistant",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Create inline styles for logo inversion in light mode
  const logoStyle = {
    filter: mounted && resolvedTheme === 'light' ? 'invert(100%)' : 'none'
  };
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md overflow-hidden">
                  <Image 
                    src="/turfy_ball_minimal.png" 
                    alt="Turfy Logo" 
                    width={24} 
                    height={24}
                    className="object-contain"
                    style={logoStyle}
                    priority
                  />
                </div>
                <span className="text-base font-semibold">Turfy Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
