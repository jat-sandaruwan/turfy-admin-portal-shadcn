"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { VenueSearch } from "@/components/dashboard/venue-search"
import { usePathname } from "next/navigation"
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { useVenueStore } from "@/lib/store/venue-store"
import { Fragment } from "react"

/**
 * Dynamic breadcrumb component for the site header
 * Shows the current location in the application hierarchy
 * Includes active venue name when applicable
 */
export function SiteHeader() {
  const pathname = usePathname()
  const { activeVenueId, activeVenueName } = useVenueStore()
  
  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const paths = pathname.split('/').filter(Boolean)
    
    // Dashboard is always the first item
    const items = [
      { label: 'Dashboard', path: '/dashboard', isCurrent: paths.length === 1 }
    ]
    
    // Add path segments
    for (let i = 1; i < paths.length; i++) {
      const label = capitalizeAndFormat(paths[i])
      const path = `/${paths.slice(0, i + 1).join('/')}`
      const isCurrent = i === paths.length - 1
      
      items.push({ label, path, isCurrent })
    }
    
    // Add active venue as the final item if present
    if (activeVenueId && activeVenueName) {
      const venueItem = { 
        label: activeVenueName, 
        path: '', 
        isCurrent: true 
      }
      
      // If we're on a venue-specific page, add the venue name as the final item
      items.push(venueItem)
    }
    
    return items
  }
  
  // Helper to convert slug format to Title Case
  const capitalizeAndFormat = (text: string) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  const breadcrumbItems = getBreadcrumbItems()

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height)]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <Fragment key={item.path || index}>
                <BreadcrumbItem>
                  {item.isCurrent ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.path}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && (
                  <BreadcrumbSeparator />
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="ml-auto flex items-center gap-2">
          <VenueSearch />
        </div>
      </div>
    </header>
  )
}
