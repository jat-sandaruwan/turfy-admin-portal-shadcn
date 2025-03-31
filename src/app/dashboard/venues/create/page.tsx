"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVenueStore } from "@/lib/store/venue-store";
import React from "react";

// Import tab content components
import { DetailsTabContent } from "@/components/venues/create/DetailsTabContent";
import { LocationTabContent } from "@/components/venues/create/LocationTabContent";
import { FeaturesTabContent } from "@/components/venues/create/FeaturesTabContent";

// Import types
import { venueFormSchema, VenueFormValues, SportsType, Amenity } from "./types";

export default function CreateVenuePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [venueOwners, setVenueOwners] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [sportsTypes, setSportsTypes] = useState<SportsType[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoadingSportsTypes, setIsLoadingSportsTypes] = useState(true);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();
  const { setActiveVenue } = useVenueStore();

  // Default values for the form
  const defaultValues: Partial<VenueFormValues> = {
    name: "",
    description: "",
    address: "",
    country: "GB",
    currency: "GBP",
    longitude: "0",
    latitude: "0",
    commissionPercentage: "10",
    ownerId: "",
    sportsTypes: [],
    amenities: [],
  };

  // Initialize form
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueFormSchema),
    defaultValues,
  });

  // Fetch venue owners on component mount
  React.useEffect(() => {
    const fetchVenueOwners = async () => {
      setIsLoadingOwners(true);
      try {
        const response = await fetch("/api/users/venue-owners");
        if (!response.ok) throw new Error("Failed to fetch venue owners");

        const data = await response.json();
        setVenueOwners(data);
      } catch (error) {
        console.error("Error fetching venue owners:", error);
        toast.error("Failed to load venue owners. Please try again.");
      } finally {
        setIsLoadingOwners(false);
      }
    };

    fetchVenueOwners();
  }, []);

  // Fetch sports types and amenities on component mount
  React.useEffect(() => {
    const fetchSportsTypes = async () => {
      setIsLoadingSportsTypes(true);
      try {
        const response = await fetch("/api/sports-types");
        if (!response.ok) throw new Error("Failed to fetch sports types");

        const data = await response.json();
        setSportsTypes(data);
      } catch (error) {
        console.error("Error fetching sports types:", error);
        setFetchError("Failed to load sports types. Please try again.");
      } finally {
        setIsLoadingSportsTypes(false);
      }
    };

    const fetchAmenities = async () => {
      setIsLoadingAmenities(true);
      try {
        const response = await fetch("/api/amenities");
        if (!response.ok) throw new Error("Failed to fetch amenities");

        const data = await response.json();
        setAmenities(data);
      } catch (error) {
        console.error("Error fetching amenities:", error);
        setFetchError("Failed to load amenities. Please try again.");
      } finally {
        setIsLoadingAmenities(false);
      }
    };

    fetchSportsTypes();
    fetchAmenities();
  }, []);

  // Handle map location selection
  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
    countryCode: string;
    currency: string;
  }) => {
    form.setValue("latitude", location.latitude.toString(), { shouldValidate: true });
    form.setValue("longitude", location.longitude.toString(), { shouldValidate: true });
    form.setValue("address", location.address, { shouldValidate: true });
    form.setValue("country", location.countryCode, { shouldValidate: true });
    form.setValue("currency", location.currency, { shouldValidate: true });
  };

  // Tab navigation handlers
  const handleDetailsNext = () => setActiveTab("location");
  const handleLocationBack = () => setActiveTab("details");
  const handleLocationNext = () => setActiveTab("features");
  const handleFeaturesBack = () => setActiveTab("location");

  // Form submission handler
  async function onSubmit(data: VenueFormValues) {
    setIsSubmitting(true);

    // Format data for API
    const venueData = {
      ...data,
      longitude: parseFloat(data.longitude),
      latitude: parseFloat(data.latitude),
      commissionPercentage: parseFloat(data.commissionPercentage),
    };

    try {
      const response = await fetch("/api/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venueData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create venue");
      }

      const newVenue = await response.json();

      // Set the new venue as active and show success notification
      setActiveVenue(newVenue._id, newVenue.name);
      toast.success("Venue created successfully!");

      // Redirect to venue details page
      router.push(`/dashboard/venues/${newVenue._id}`);
    } catch (error) {
      console.error("Error creating venue:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create venue");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-3xl py-6 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Building className="h-6 w-6" />
            Create New Venue
          </CardTitle>
          <CardDescription>
            Create a new venue on behalf of a venue owner. The venue will be
            created with 'pending' status and will need to be approved.
          </CardDescription>
        </CardHeader>

        {fetchError && (
          <Alert variant="destructive" className="mx-6 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mx-6 mb-2">
                <TabsTrigger value="details">Venue Details</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="features">Features & Owner</TabsTrigger>
              </TabsList>

              <CardContent className="p-6 pt-2">
                <TabsContent value="details">
                  <DetailsTabContent form={form} onNext={handleDetailsNext} />
                </TabsContent>

                <TabsContent value="location">
                  <LocationTabContent 
                    form={form}
                    onBack={handleLocationBack}
                    onNext={handleLocationNext}
                    handleLocationSelect={handleLocationSelect}
                  />
                </TabsContent>

                <TabsContent value="features">
                  <FeaturesTabContent
                    form={form}
                    onBack={handleFeaturesBack}
                    isSubmitting={isSubmitting}
                    isLoadingOwners={isLoadingOwners}
                    isLoadingSportsTypes={isLoadingSportsTypes}
                    isLoadingAmenities={isLoadingAmenities}
                    sportsTypes={sportsTypes}
                    amenities={amenities}
                    venueOwners={venueOwners}
                  />
                </TabsContent>
              </CardContent>
            </Tabs>

            <CardFooter className="flex justify-between border-t p-6">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingOwners}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Venue
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}