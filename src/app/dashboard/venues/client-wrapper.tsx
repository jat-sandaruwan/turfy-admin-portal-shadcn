"use client";

import { useSearchParams } from "next/navigation";
import { VenuesTable } from "@/components/venues/venues-table";
import { VenuesTableSkeleton } from "@/components/venues/venues-table-skeleton";
import { Suspense, useEffect } from "react";

interface ClientWrapperProps {
  status: string;
  query: string;
  sort: string;
  page: number;
  country: string;
}

export function ClientWrapper({ status, query, sort, page, country }: ClientWrapperProps) {
  // Re-render when URL parameters change
  const searchParams = useSearchParams();
  
  // Debug log to see when props change
  useEffect(() => {
    console.log("ClientWrapper props updated:", {
      status,
      query,
      sort,
      page,
      country
    });
  }, [status, query, sort, page, country]);
  
  // Generate a unique key that changes whenever any filter param changes
  const tableKey = `venues-${status}-${query}-${sort}-${page}-${country}`;
  
  return (
    <Suspense key={tableKey} fallback={<VenuesTableSkeleton />}>
      <VenuesTable
        status={status}
        query={query}
        sort={sort}
        page={page}
        country={country}
      />
    </Suspense>
  );
}