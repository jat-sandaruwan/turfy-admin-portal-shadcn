"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building, Map, User, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useVenueStore } from "@/lib/store/venue-store";
import React from "react";
import GoogleMapSelector from "@/components/venues/GoogleMapSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define form schema with Zod
const venueFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Venue name must be at least 3 characters." })
    .max(100, { message: "Venue name must be less than 100 characters." }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters." })
    .optional(),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters." })
    .max(200, { message: "Address must be less than 200 characters." }),
  country: z
    .string()
    .length(2, { message: "Country code must be 2 characters (ISO 3166-1 alpha-2)." })
    .regex(/^[A-Z]{2}$/, { message: "Country code must be 2 uppercase letters." }),
  currency: z
    .string()
    .length(3, { message: "Currency code must be 3 characters (ISO 4217)." })
    .regex(/^[A-Z]{3}$/, { message: "Currency code must be 3 uppercase letters." }),
  longitude: z
    .string()
    .refine((val) => !Number.isNaN(parseFloat(val)), {
      message: "Longitude must be a valid number.",
    })
    .refine((val) => parseFloat(val) >= -180 && parseFloat(val) <= 180, {
      message: "Longitude must be between -180 and 180.",
    }),
  latitude: z
    .string()
    .refine((val) => !Number.isNaN(parseFloat(val)), {
      message: "Latitude must be a valid number.",
    })
    .refine((val) => parseFloat(val) >= -90 && parseFloat(val) <= 90, {
      message: "Latitude must be between -90 and 90.",
    }),
  commissionPercentage: z
    .string()
    .refine((val) => !Number.isNaN(parseFloat(val)), {
      message: "Commission percentage must be a valid number.",
    })
    .refine((val) => parseFloat(val) >= 0 && parseFloat(val) <= 100, {
      message: "Commission percentage must be between 0 and 100.",
    }),
  ownerId: z.string().min(1, { message: "Please select a venue owner" }),
  sportsTypes: z.array(z.string()).min(1, { message: "Select at least one sport type" }),
  amenities: z.array(z.string()).optional(),
});

type VenueFormValues = z.infer<typeof venueFormSchema>;

// Common sports types
const SPORTS_TYPES = [
  "Football",
  "Cricket",
  "Tennis",
  "Basketball",
  "Badminton",
  "Volleyball",
  "Rugby",
  "Hockey",
  "Baseball",
  "Table Tennis",
  "Swimming",
];

// Common amenities
const AMENITIES = [
  "Changing Rooms",
  "Showers",
  "Parking",
  "Cafe",
  "Water Fountain",
  "Seating Area",
  "Equipment Rental",
  "Lockers",
  "Toilets",
  "WiFi",
  "Floodlights",
];

export default function CreateVenuePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [venueOwners, setVenueOwners] = useState<{id: string, name: string}[]>([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mx-6 mb-2">
                <TabsTrigger value="details">Venue Details</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="features">Features & Owner</TabsTrigger>
              </TabsList>
              
              <CardContent className="p-6 pt-2">
                <TabsContent value="details" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter venue name" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of the venue as it will appear to users.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter venue description"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A detailed description of the venue.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="commissionPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission Percentage*</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormDescription>
                          Platform commission percentage (0-100).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("location")}
                    >
                      Next: Location
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="location" className="space-y-4 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Venue Location</h3>
                    <p className="text-sm text-muted-foreground">
                      Select the venue location on the map. You can click on the map or drag the marker to set the exact location.
                    </p>
                    
                    <GoogleMapSelector 
                      onLocationSelect={handleLocationSelect}
                      initialLatitude={form.getValues('latitude') ? parseFloat(form.getValues('latitude')) : undefined}
                      initialLongitude={form.getValues('longitude') ? parseFloat(form.getValues('longitude')) : undefined}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address*</FormLabel>
                          <FormControl>
                            <Input placeholder="Full address" {...field} />
                          </FormControl>
                          <FormDescription>
                            The physical address of the venue.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country*</FormLabel>
                            <FormControl>
                              <Input placeholder="GB" {...field} />
                            </FormControl>
                            <FormDescription>
                              ISO 3166-1 alpha-2 code (e.g., GB, US).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency*</FormLabel>
                            <FormControl>
                              <Input placeholder="GBP" {...field} />
                            </FormControl>
                            <FormDescription>
                              ISO 4217 code (e.g., GBP, USD).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitude*</FormLabel>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude*</FormLabel>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("details")}
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("features")}
                    >
                      Next: Features & Owner
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="features" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="sportsTypes"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Sports Types*</FormLabel>
                          <FormDescription>
                            Select the types of sports that can be played at this venue.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {SPORTS_TYPES.map((sport) => (
                            <FormItem
                              key={sport}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 mt-1"
                                  checked={field.value?.includes(sport)}
                                  onChange={(e) => {
                                    const updatedValue = e.target.checked
                                      ? [...(field.value || []), sport]
                                      : field.value?.filter((s) => s !== sport) || [];
                                    field.onChange(updatedValue);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {sport}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amenities"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Amenities</FormLabel>
                          <FormDescription>
                            Select the amenities available at this venue.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {AMENITIES.map((amenity) => (
                            <FormItem
                              key={amenity}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 mt-1"
                                  checked={field.value?.includes(amenity)}
                                  onChange={(e) => {
                                    const updatedValue = e.target.checked
                                      ? [...(field.value || []), amenity]
                                      : field.value?.filter((a) => a !== amenity) || [];
                                    field.onChange(updatedValue);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {amenity}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ownerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Owner*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isLoadingOwners}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a venue owner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingOwners ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="ml-2">Loading...</span>
                              </div>
                            ) : (
                              venueOwners.map((owner) => (
                                <SelectItem key={owner.id} value={owner.id}>
                                  {owner.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The owner of this venue.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("location")}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || isLoadingOwners}
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Venue
                    </Button>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
            
            <CardFooter className="flex justify-between border-t p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoadingOwners}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Venue
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}