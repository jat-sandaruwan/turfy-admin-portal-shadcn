"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Check,
  X,
  RotateCcw // Added for restore functionality
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Venue } from "@/types/venues";
import { Toaster } from "@/components/ui/sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface VenuesTableProps {
  status: string;
  query: string;
  sort: string;
  page: number;
  country: string;
}

export function VenuesTable({ status, query, sort, page, country }: VenuesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentParams, setCurrentParams] = useState<{ status: string; query: string; sort: string; page: number; country: string; refresh?: number }>({ status, query, sort, page, country });
  
  const limit = 10;
  
  // Create a new URLSearchParams instance instead of directly using searchParams
  // since searchParams is read-only in Next.js
  const createQueryString = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    }
    
    return newSearchParams.toString();
  };
  
  // Update currentParams when props change
  useEffect(() => {
    if (
      status !== currentParams.status ||
      query !== currentParams.query ||
      sort !== currentParams.sort ||
      page !== currentParams.page ||
      country !== currentParams.country
    ) {
      setCurrentParams({ status, query, sort, page, country });
      setLoading(true);
    }
  }, [status, query, sort, page, country]);
  
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        
        const queryParams = new URLSearchParams();
        // The issue is here - we need to ensure status is properly passed to API
        if (currentParams.status && currentParams.status !== "all") {
          queryParams.append("status", currentParams.status);
        }
        if (currentParams.query) queryParams.append("q", currentParams.query);
        if (currentParams.sort) queryParams.append("sort", currentParams.sort);
        if (currentParams.page) queryParams.append("page", currentParams.page.toString());
        if (currentParams.country) queryParams.append("country", currentParams.country);
        queryParams.append("limit", limit.toString());
        
        // Add console logging to debug the API call parameters
        console.log(`Fetching venues with params:`, {
          status: currentParams.status,
          query: currentParams.query,
          sort: currentParams.sort,
          page: currentParams.page,
          country: currentParams.country,
          queryString: queryParams.toString()
        });
        
        const response = await fetch(`/api/venues?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch venues: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.venues.length} venues with status: ${currentParams.status}`);
        setVenues(data.venues);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error("Error fetching venues:", error);
        toast.error("Error", {
          description: "Failed to load venues"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVenues();
  }, [currentParams]);
  
  const handleSort = (columnKey: string) => {
    const currentSort = sort || "createdAt_desc";
    const [currentColumn, currentDirection] = currentSort.split("_");
    
    let newSort: string;
    if (currentColumn === columnKey) {
      newSort = `${columnKey}_${currentDirection === "asc" ? "desc" : "asc"}`;
    } else {
      newSort = `${columnKey}_asc`;
    }
    
    router.push(
      `${pathname}?${createQueryString({ sort: newSort, page: "1" })}`
    );
  };
  
  const handleStatusChange = async (venueId: string, newStatus: "pending" | "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/venues/${venueId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update venue status");
      }
      
      setVenues((prevVenues) =>
        prevVenues.map((venue) =>
          venue._id === venueId ? { ...venue, status: newStatus } : venue
        )
      );
      
      toast.success("Success", {
        description: `Venue status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to update venue status"
      });
    }
  };

  // Enhanced delete handler with better error handling and loading state
  const handleDelete = async (venueId: string) => {
    try {
      // Show loading state in toast
      toast.loading("Deleting venue...");
      
      const response = await fetch(`/api/venues/${venueId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // Dismiss the loading toast
      toast.dismiss();
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete venue");
      }
      
      // Success - update UI and show success message
      toast.success("Venue deleted successfully");
      
      // Update local state to remove the deleted venue
      setVenues(prevVenues => prevVenues.filter(venue => venue._id !== venueId));
      
      // If we're showing deleted venues, we might want to refresh instead
      if (currentParams.status === "deleted") {
        // Trigger a refetch by changing the currentParams
        setCurrentParams({...currentParams, refresh: Date.now()});
      }
      
    } catch (error: any) {
      console.error("Error deleting venue:", error);
      toast.error(error.message || "Failed to delete venue");
    }
  };

  // Add a new handler for restoring venues
  const handleRestore = async (venueId: string) => {
    try {
      // Show loading state in toast
      toast.loading("Restoring venue...");
      
      const response = await fetch(`/api/venues/${venueId}/restore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // Dismiss the loading toast
      toast.dismiss();
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to restore venue");
      }
      
      // Success - update UI and show success message
      toast.success("Venue restored successfully");
      
      // Remove the venue from the current list if we're in the deleted view
      if (currentParams.status === "deleted") {
        setVenues(prevVenues => prevVenues.filter(venue => venue._id !== venueId));
      } else {
        // If we're in another view, simply update the venue status
        const restoredData = await response.json();
        setVenues(prevVenues =>
          prevVenues.map(venue =>
            venue._id === venueId ? { ...venue, deletedAt: null, status: restoredData.venue.status } : venue
          )
        );
      }
      
    } catch (error: any) {
      console.error("Error restoring venue:", error);
      toast.error(error.message || "Failed to restore venue");
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-400">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-400">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead className="w-[250px]">
                <Button variant="ghost" className="px-0" onClick={() => handleSort("name")}>
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">
                <Button variant="ghost" className="px-0" onClick={() => handleSort("createdAt")}>
                  Created
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : venues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No venues found.
                </TableCell>
              </TableRow>
            ) : (
              venues.map((venue) => (
                <TableRow key={venue._id}>
                  <TableCell className="font-mono text-sm">{venue._id.substring(0, 6)}...</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {venue.images && venue.images.length > 0 ? (
                        <div className="relative h-8 w-8 rounded-md overflow-hidden">
                          <Image
                            src={venue.images[0]}
                            alt={venue.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <Link href={`/dashboard/venues/${venue._id}`} className="font-medium hover:underline">
                        {venue.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col">
                      <span className="text-sm">{venue.address}</span>
                      <span className="text-xs text-muted-foreground">{venue.country}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {venue.createdAt && format(new Date(venue.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {getStatusBadge(venue.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/venues/${venue._id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        
                        {/* Only show Edit for non-deleted venues */}
                        {currentParams.status !== "deleted" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/venues/${venue._id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        {/* Only show status change options for non-deleted venues */}
                        {currentParams.status !== "deleted" && (
                          <>
                            {venue.status !== "approved" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(venue._id, "approved")}>
                                <Check className="mr-2 h-4 w-4 text-green-600" /> Approve
                              </DropdownMenuItem>
                            )}
                            
                            {venue.status !== "rejected" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(venue._id, "rejected")}>
                                <X className="mr-2 h-4 w-4 text-red-600" /> Reject
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                          </>
                        )}
                        
                        {/* Show restore button for deleted venues */}
                        {currentParams.status === "deleted" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <RotateCcw className="mr-2 h-4 w-4 text-green-600" /> 
                                <span className="text-green-600">Restore</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Restore this venue?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will restore the venue to its previous state and make it available in the system again.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleRestore(venue._id);
                                  }}
                                >
                                  Restore
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          /* Show delete button only for non-deleted venues */
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4 text-red-600" /> 
                                <span className="text-red-600">Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will mark the venue as deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={(e) => {
                                    e.preventDefault(); // Prevent the dialog from closing immediately
                                    handleDelete(venue._id);
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href={page > 1 ? `${pathname}?${createQueryString({ page: (page - 1).toString() })}` : "#"}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <PaginationItem key={pageNum}>
                <PaginationLink 
                  href={`${pathname}?${createQueryString({ page: pageNum.toString() })}`}
                  isActive={pageNum === page}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href={page < totalPages ? `${pathname}?${createQueryString({ page: (page + 1).toString() })}` : "#"}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      <div className="text-xs text-muted-foreground">
        Showing {venues.length} of {totalCount} venues
      </div>
    </div>
  );
}