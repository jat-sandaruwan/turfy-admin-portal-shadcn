"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Building, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenueStore } from "@/lib/store/venue-store";

interface VenueDetails {
  _id: string;
  name: string;
  description: string;
  address: string;
  country: string;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  commissionPercentage: number;
  owner: {
    _id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  ratingAverage: number;
  ratingCount: number;
}

export default function VenueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<VenueDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setActiveVenue } = useVenueStore();
  
  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        const response = await fetch(`/api/venues/${id}`);
        if (!response.ok) throw new Error("Failed to fetch venue details");
        
        const data = await response.json();
        setVenue(data);
        
        // Set this venue as active in the store
        setActiveVenue(data._id, data.name);
      } catch (error) {
        console.error("Error fetching venue details:", error);
        toast.error("Failed to load venue details");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchVenueDetails();
    }
  }, [id, setActiveVenue]);
  
  if (isLoading) {
    return (
      <div className="container py-6">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }
  
  if (!venue) {
    return (
      <div className="container py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Venue Not Found</h1>
        <p>The requested venue could not be found.</p>
      </div>
    );
  }
  
  // Helper function for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8" />
            {venue.name}
          </h1>
          <p className="text-muted-foreground mt-1">{venue.address}</p>
        </div>
        <div>{getStatusBadge(venue.status)}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
            <CardDescription>Basic details about this venue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">
                {venue.description || "No description provided"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Country</h3>
                <p className="text-sm text-muted-foreground">{venue.country}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Currency</h3>
                <p className="text-sm text-muted-foreground">{venue.currency}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Commission</h3>
              <p className="text-sm text-muted-foreground">
                {venue.commissionPercentage}%
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Created</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(venue.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
            <CardDescription>Details about the venue owner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Name</h3>
              <p className="text-sm text-muted-foreground">
                {venue.owner.name}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Email</h3>
              <p className="text-sm text-muted-foreground">
                {venue.owner.email || "No email provided"}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Owner ID</h3>
              <p className="text-sm font-mono text-muted-foreground">
                {venue.owner._id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}