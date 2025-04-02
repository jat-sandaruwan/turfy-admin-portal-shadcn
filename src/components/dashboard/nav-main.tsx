"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

type MenuItem = {
  title: string
  url: string
  icon?: Icon
  submenu?: MenuItem[]
}

export function NavMain({
  items,
}: {
  items: MenuItem[]
}) {
  const pathname = usePathname()

  // Helper function to check if item is active
  const isActive = (url: string) => {
    if (url === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    return pathname.startsWith(url) && url !== "/dashboard"
  }

  // Helper function to check if a submenu item should be open by default
  const shouldBeOpen = (item: MenuItem) => {
    if (isActive(item.url)) return true
    if (item.submenu?.some(subItem => pathname === subItem.url)) return true
    return false
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Main navigation menu */}
        <SidebarMenu>
          {items.map((item) => (
            item.submenu ? (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={shouldBeOpen(item)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      tooltip={item.title} 
                      isActive={isActive(item.url)}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.submenu.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          {/* Use either Link or SidebarMenuSubButton, not both */}
                          <div 
                            onClick={() => window.location.href = subItem.url}
                            className="w-full cursor-pointer"
                          >
                            <SidebarMenuSubButton 
                              isActive={pathname === subItem.url}
                              className="w-full"
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </div>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
                  <SidebarMenuButton tooltip={item.title} isActive={isActive(item.url)}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
