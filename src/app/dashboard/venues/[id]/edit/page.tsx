"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Save, ArrowLeft, Building, MapPin, Info, ImageIcon } from "lucide-react";
import Image from "next/image";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

// Validation schema for the form
const venueEditFormSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    commissionPercentage: z.coerce.number().min(0).max(100),
    status: z.enum(["pending", "approved", "rejected"]),
    isEnabled: z.boolean(),
    sportsTypes: z.array(z.string()).min(1, "At least one sport type is required"),
    amenities: z.array(z.string()),
});

type VenueFormValues = z.infer<typeof venueEditFormSchema>;

// Interface for venue details
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
    deletedAt?: string;
}

// Predefined options
const SPORT_OPTIONS = [
    "football", "basketball", "tennis", "cricket", "volleyball",
    "badminton", "swimming", "table tennis", "padel", "squash"
];

const AMENITY_OPTIONS = [
    "parking", "changing rooms", "showers", "toilets", "cafe",
    "lighting", "equipment rental", "wifi", "first aid", "spectator area"
];

export default function EditVenuePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [venue, setVenue] = useState<VenueDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const [isUnsavedChanges, setIsUnsavedChanges] = useState(false);

    // Form initialization
    const form = useForm<VenueFormValues>({
        resolver: zodResolver(venueEditFormSchema),
        defaultValues: {
            name: "",
            description: "",
            commissionPercentage: 0,
            status: "pending",
            isEnabled: false,
            sportsTypes: [],
            amenities: [],
        },
        mode: "onChange",
    });

    // Track form changes
    useEffect(() => {
        const subscription = form.watch(() => {
            setIsUnsavedChanges(true);
        });
        return () => subscription.unsubscribe();
    }, [form.watch]);

    // Fetch venue details
    useEffect(() => {
        const fetchVenueDetails = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/venues/${id}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch venue details");
                }

                const data = await response.json();
                setVenue(data);

                // Set form default values with venue data
                form.reset({
                    name: data.name,
                    description: data.description,
                    commissionPercentage: data.commissionPercentage,
                    status: data.status,
                    isEnabled: data.isEnabled,
                    sportsTypes: data.sportsTypes || [],
                    amenities: data.amenities || [],
                });

                setIsUnsavedChanges(false);
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
    }, [id, form]);

    // Form submission handler
    const onSubmit = async (values: VenueFormValues) => {
        if (!venue) return;

        try {
            setIsSaving(true);

            const response = await fetch(`/api/venues/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to update venue");
            }

            const updatedVenue = await response.json();
            toast.success("Venue updated successfully");
            setIsUnsavedChanges(false);

            // Navigate back to venue details page
            router.push(`/dashboard/venues/${id}`);
        } catch (error) {
            console.error("Error updating venue:", error);
            toast.error("Failed to update venue");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSportsSelect = (sport: string) => {
        const currentSports = form.getValues().sportsTypes;

        if (currentSports.includes(sport)) {
            form.setValue("sportsTypes", currentSports.filter(s => s !== sport), {
                shouldValidate: true,
                shouldDirty: true,
            });
        } else {
            form.setValue("sportsTypes", [...currentSports, sport], {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    };

    const handleAmenitySelect = (amenity: string) => {
        const currentAmenities = form.getValues().amenities;

        if (currentAmenities.includes(amenity)) {
            form.setValue("amenities", currentAmenities.filter(a => a !== amenity), {
                shouldValidate: true,
                shouldDirty: true,
            });
        } else {
            form.setValue("amenities", [...currentAmenities, amenity], {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="container py-10 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-medium">Loading venue details...</p>
                </div>
            </div>
        );
    }

    if (!venue) {
        return (
            <div className="container py-10 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-medium">Venue not found</p>
                    <Button
                        className="mt-4"
                        variant="outline"
                        onClick={() => router.push("/dashboard/venues")}
                    >
                        Back to Venues
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-6">
            {/* Header with back button and title */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (isUnsavedChanges) {
                                    document.getElementById('unsaved-changes-dialog-trigger')?.click();
                                } else {
                                    router.back();
                                }
                            }}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold ml-2">Edit Venue</h1>
                    </div>
                    <Button
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSaving || !isUnsavedChanges}
                    >
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                </div>

                {/* Venue name and address display */}
                <div className="mt-2 ml-9">
                    <h2 className="text-xl font-medium flex items-center gap-2">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        {venue.name}
                    </h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {venue.address}
                    </p>
                </div>
            </div>

            {/* Unsaved changes dialog */}
            <AlertDialog>
                <AlertDialogTrigger id="unsaved-changes-dialog-trigger" className="hidden" />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to leave without saving?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.back()}>Leave</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full">
                            <TabsTrigger value="basic" className="flex-1">
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger value="features" className="flex-1">
                                Features
                            </TabsTrigger>
                            <TabsTrigger value="images" className="flex-1">
                                Images
                            </TabsTrigger>
                            <TabsTrigger value="location" className="flex-1">
                                Location
                            </TabsTrigger>
                        </TabsList>

                        {/* Basic Info Tab */}
                        <TabsContent value="basic" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Venue Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter venue name" {...field} />
                                                </FormControl>
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
                                                        placeholder="Describe the venue"
                                                        className="min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Provide detailed information about the venue
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="commissionPercentage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Commission Percentage</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Platform commission for bookings (0-100%)
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Status</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="approved">Approved</SelectItem>
                                                            <SelectItem value="rejected">Rejected</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        Current status of the venue
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="isEnabled"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-md border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Enable Venue</FormLabel>
                                                    <FormDescription>
                                                        When disabled, the venue won't be bookable
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Features Tab */}
                        <TabsContent value="features" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sports Types</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="sportsTypes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Available Sports</FormLabel>
                                                <FormDescription>
                                                    Select all sports that can be played at this venue
                                                </FormDescription>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {SPORT_OPTIONS.map((sport) => (
                                                        <Badge
                                                            key={sport}
                                                            variant={field.value.includes(sport) ? "default" : "outline"}
                                                            className="px-3 py-1 cursor-pointer capitalize"
                                                            onClick={() => handleSportsSelect(sport)}
                                                        >
                                                            {sport}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Amenities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="amenities"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Available Amenities</FormLabel>
                                                <FormDescription>
                                                    Select all amenities available at this venue
                                                </FormDescription>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {AMENITY_OPTIONS.map((amenity) => (
                                                        <Badge
                                                            key={amenity}
                                                            variant={field.value.includes(amenity) ? "default" : "outline"}
                                                            className="px-3 py-1 cursor-pointer capitalize"
                                                            onClick={() => handleAmenitySelect(amenity)}
                                                        >
                                                            {amenity}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Images Tab */}
                        <TabsContent value="images" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Venue Images</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {venue.images && venue.images.length > 0 ? (
                                            venue.images.map((image, index) => (
                                                <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                                                    <Image
                                                        src={image}
                                                        alt={`Venue image ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full flex flex-col items-center justify-center p-12 border rounded-md border-dashed">
                                                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                                                <p className="text-sm text-muted-foreground">
                                                    No images available
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-4">
                                        Note: To add or remove images, please contact support
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Location Tab (Non-editable) */}
                        <TabsContent value="location" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Location Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-md">
                                        <Info className="h-5 w-5 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            Location details cannot be edited. Please contact support if you need to change the address, country, or currency.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium">Address</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">{venue.address}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="font-medium">Country</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">{venue.country}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Currency</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">{venue.currency}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-medium">Coordinates</h3>
                                        <p className="mt-1 text-sm font-mono text-muted-foreground">
                                            {venue.location?.coordinates?.[1]?.toFixed(6)}, {venue.location?.coordinates?.[0]?.toFixed(6)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </Form>
        </div>
    );
}