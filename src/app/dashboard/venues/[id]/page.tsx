"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Building, 
  Loader2, 
  MapPin, 
  Star, 
  Calendar, 
  Tag, 
  FileSpreadsheet,
  Clock,
  Users,
  Check,
  X,
  Trash2,
  RotateCcw,
  Pencil
} from "lucide-react";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenueStore } from "@/lib/store/venue-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Extended interface to include all venue properties
interface VenueDetails {
  _id: string;
  name: string;
  description: string;
  address: string;
  location: {
    type: string;
    coordinates: number[];
  };
  country: string;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  commissionPercentage: number;
  amenities: string[];
  sportsTypes: string[];
  images: string[];
  isEnabled: boolean;
  owner: {
    _id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
  ratingAverage: number;
  ratingCount: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  facilities: any[];
  managers: {
    user: {
      _id: string;
      name: string;
      email?: string;
    };
    role: 'manager' | 'assistant' | 'staff';
  }[];
  stripeAccountId?: string;
  stripeOnboardingComplete: boolean;
  deletedAt?: string;
}

export default function VenueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<VenueDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const { setActiveVenue } = useVenueStore();
  const router = useRouter();
  
  // Action states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
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
  
  // Handle venue status change
  const handleStatusChange = async (status: 'approved' | 'rejected' | 'pending') => {
    if (!venue) return;
    
    try {
      setIsUpdatingStatus(true);
      const response = await fetch(`/api/venues/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      
      const updatedVenue = await response.json();
      setVenue(updatedVenue.venue);
      toast.success(`Venue status updated to ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update venue status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  // Handle venue soft delete
  const handleDelete = async () => {
    if (!venue) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/venues/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete venue");
      }
      
      toast.success("Venue deleted successfully");
      router.push("/dashboard/venues?status=deleted");
    } catch (error) {
      console.error("Error deleting venue:", error);
      toast.error("Failed to delete venue");
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle venue restore
  const handleRestore = async () => {
    if (!venue || !venue.deletedAt) return;
    
    try {
      setIsRestoring(true);
      const response = await fetch(`/api/venues/${id}/restore`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error("Failed to restore venue");
      }
      
      const updatedVenue = await response.json();
      setVenue(updatedVenue.venue);
      toast.success("Venue restored successfully");
    } catch (error) {
      console.error("Error restoring venue:", error);
      toast.error("Failed to restore venue");
    } finally {
      setIsRestoring(false);
    }
  };
  
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
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  // Format coordinates for display
  const formatCoordinates = (coordinates: number[]) => {
    if (!coordinates || coordinates.length < 2) return "Not available";
    return `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`;
  };

  return (
    <div className="container py-6">
      {/* Header section with venue name, address and status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8" />
            {venue.name}
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {venue.address}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="mr-2">{getStatusBadge(venue.status)}</div>
          
          {/* Action buttons based on venue state */}
          <div className="flex gap-2">
            {venue.deletedAt ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-green-500 text-green-500 hover:bg-green-50"
                    disabled={isRestoring}
                  >
                    {isRestoring ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Restore Venue
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restore this venue?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will make the venue active again in the system.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-green-600 hover:bg-green-700" 
                      onClick={handleRestore}
                    >
                      Restore
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <>
                {/* Status change buttons for non-deleted venues */}
                {venue.status !== 'approved' && (
                  <Button 
                    variant="outline" 
                    className="border-green-500 text-green-500 hover:bg-green-50"
                    onClick={() => handleStatusChange('approved')}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                )}
                
                {venue.status !== 'rejected' && (
                  <Button 
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => handleStatusChange('rejected')}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                )}
                
                {/* Edit button */}
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/dashboard/venues/${id}/edit`)}
                  disabled={!!venue.deletedAt}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                {/* Delete button always shown for non-deleted venues */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will mark the venue as deleted. It can be restored later if needed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700" 
                        onClick={handleDelete}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabs for organizing content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Venue Information Card */}
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Commission</h3>
                    <p className="text-sm text-muted-foreground">
                      {venue.commissionPercentage}%
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Status</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {venue.status}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Location (Lat, Lng)</h3>
                  <p className="text-sm font-mono text-muted-foreground">
                    {formatCoordinates(venue.location?.coordinates)}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Created</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(venue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Updated</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(venue.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {venue.deletedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-red-500">Deleted</h3>
                    <p className="text-sm text-red-400">
                      {new Date(venue.deletedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium">Enabled</h3>
                  <p className="text-sm text-muted-foreground">
                    {venue.isEnabled ? "Yes" : "No"}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Owner Information Card */}
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
            
            {/* Sports & Amenities Card */}
            <Card>
              <CardHeader>
                <CardTitle>Sports & Amenities</CardTitle>
                <CardDescription>Available features of this venue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Sports Types</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {venue.sportsTypes && venue.sportsTypes.length > 0 ? (
                      venue.sportsTypes.map((sport, i) => (
                        <Badge key={i} variant="outline" className="capitalize">
                          {sport}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No sports types specified</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Amenities</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {venue.amenities && venue.amenities.length > 0 ? (
                      venue.amenities.map((amenity, i) => (
                        <Badge key={i} variant="outline" className="capitalize">
                          {amenity}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No amenities specified</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Ratings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Ratings Information</CardTitle>
                <CardDescription>User feedback for this venue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Average Rating</h3>
                  <Badge variant="secondary" className="flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                    {venue.ratingAverage.toFixed(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ({venue.ratingCount} reviews)
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Rating Distribution</h3>
                  <div className="mt-2 space-y-1">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className="flex items-center gap-2">
                        <div className="flex items-center gap-1 w-10">
                          <span className="text-sm">{rating}</span>
                          <Star className="h-3 w-3 text-yellow-500" />
                        </div>
                        <div className="h-2 bg-muted rounded-full flex-grow overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500 rounded-full"
                            style={{ 
                              width: venue.ratingCount > 0 
                                ? `${(venue.ratingDistribution[rating as keyof typeof venue.ratingDistribution] / venue.ratingCount) * 100}%` 
                                : '0%'
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {venue.ratingDistribution[rating as keyof typeof venue.ratingDistribution] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Managers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Managers</CardTitle>
              <CardDescription>Staff with access to manage this venue</CardDescription>
            </CardHeader>
            <CardContent>
              {venue.managers && venue.managers.length > 0 ? (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 pl-4 text-sm">Name</th>
                        <th className="text-left p-2 text-sm">Email</th>
                        <th className="text-left p-2 text-sm">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venue.managers.map((manager, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="p-2 pl-4">{manager.user.name}</td>
                          <td className="p-2">{manager.user.email || "No email"}</td>
                          <td className="p-2 capitalize">{manager.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No managers assigned to this venue</p>
              )}
            </CardContent>
          </Card>
          
          {/* Stripe Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Integration</CardTitle>
              <CardDescription>Stripe account details for processing payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Stripe Account ID</h3>
                  <p className="text-sm font-mono text-muted-foreground">
                    {venue.stripeAccountId || "Not connected"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Onboarding Status</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    {venue.stripeOnboardingComplete ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        Complete
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-500" />
                        Incomplete
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Images Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Venue Images</CardTitle>
              <CardDescription>Photos of the venue</CardDescription>
            </CardHeader>
            <CardContent>
              {venue.images && venue.images.map((image, index) => (
                <div key={index} className="relative w-full h-64 mb-4">
                  <Image 
                    src={image} 
                    alt={`Venue image ${index + 1}`} 
                    layout="fill" 
                    objectFit="cover" 
                    className="rounded-md"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Facilities Tab */}
        <TabsContent value="facilities">
          <Card>
            <CardHeader>
              <CardTitle>Venue Facilities</CardTitle>
              <CardDescription>Details about the facilities available</CardDescription>
            </CardHeader>
            <CardContent>
              {venue.facilities && venue.facilities.length > 0 ? (
                <ul className="list-disc pl-6">
                  {venue.facilities.map((facility, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {facility}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No facilities specified</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}