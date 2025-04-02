"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import React from "react";

interface VenuesToolbarProps {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  deletedCount: number;
  countries: { code: string; count: number }[];
  status: string;
  query: string;
}

export function VenuesToolbar({ 
  totalCount, 
  pendingCount, 
  approvedCount, 
  rejectedCount, 
  deletedCount,
  countries, 
  status,
  query 
}: VenuesToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(query || "");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  const createQueryString = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    }
    
    return newSearchParams.toString();
  };

  // Update search param when debounced search query changes
  React.useEffect(() => {
    if (debouncedSearchQuery !== query) {
      router.push(`${pathname}?${createQueryString({ q: debouncedSearchQuery || null, page: "1" })}`);
    }
  }, [debouncedSearchQuery, pathname, router]);

  const handleStatusChange = (value: string) => {
    router.push(
      `${pathname}?${createQueryString({ status: value === "all" ? null : value, page: "1" })}`
    );
  };
  
  const handleCountryChange = (value: string) => {
    router.push(
      `${pathname}?${createQueryString({ country: value || null, page: "1" })}`
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search venues..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Country {searchParams.get("country") ? `(${searchParams.get("country")})` : ""}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup
                value={searchParams.get("country") || ""}
                onValueChange={handleCountryChange}
              >
                <DropdownMenuRadioItem value="">All Countries</DropdownMenuRadioItem>
                {countries.map((country) => (
                  <DropdownMenuRadioItem key={country.code} value={country.code}>
                    {country.code} <span className="ml-auto text-muted-foreground">({country.count})</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery("");
              router.push(pathname);
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      
      {/* Updated tabs: 5 columns including Deleted */}
      <Tabs value={status} onValueChange={handleStatusChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex gap-2">
            All
            <Badge variant="secondary">{totalCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex gap-2">
            Pending
            <Badge variant="secondary">{pendingCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex gap-2">
            Approved
            <Badge variant="secondary">{approvedCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex gap-2">
            Rejected
            <Badge variant="secondary">{rejectedCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="deleted" className="flex gap-2">
            Deleted
            <Badge variant="secondary">{deletedCount}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}