"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { VenueFormValues, SportsType, Amenity } from "@/app/dashboard/venues/create/types";
import { MapPin, CreditCard, Tag, User, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface ReviewTabContentProps {
  form: UseFormReturn<VenueFormValues>;
  onBack: () => void;
  isSubmitting: boolean;
  sportsTypes: SportsType[];
  amenities: Amenity[];
  venueOwners: { id: string; name: string }[];
}

/**
 * Provides a review of all venue details before submission
 * Shows a summary of all fields grouped by category
 */
export function ReviewTabContent({
  form,
  onBack,
  isSubmitting,
  sportsTypes,
  amenities,
  venueOwners,
}: ReviewTabContentProps) {
  // Get form values
  const values = form.getValues();
  
  // Find selected sports types names
  const selectedSportsTypes = sportsTypes
    .filter(sport => values.sportsTypes?.includes(sport._id))
    .map(sport => sport.name);
  
  // Find selected amenities names
  const selectedAmenities = amenities
    .filter(amenity => values.amenities?.includes(amenity.value))
    .map(amenity => amenity.name);
    
  // Find venue owner name
  const ownerName = venueOwners.find(owner => owner.id === values.ownerId)?.name || "";

  return (
    <div className="space-y-6 mt-0">
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2 flex items-center gap-1 text-primary">
          <CheckCircle2 className="h-5 w-5" />
          Review Venue Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Please review all information before creating the venue. You can go back to any section to make changes.
        </p>
      </div>

      {/* Basic Details Section */}
      <Card className="overflow-hidden border border-muted">
        <div className="bg-muted px-4 py-2 border-b border-muted">
          <h3 className="text-sm font-medium">Venue Information</h3>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium truncate">{values.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Commission</p>
              <p className="font-medium">{values.commissionPercentage}%</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm">{values.description || "No description provided"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Location Section */}
      <Card className="overflow-hidden border border-muted">
        <div className="bg-muted px-4 py-2 border-b border-muted flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Location Details</h3>
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="font-medium">{values.address}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Country</p>
              <p className="font-medium">{values.country}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Currency</p>
              <p className="font-medium">{values.currency}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Coordinates</p>
              <p className="text-sm truncate">
                {values.latitude}, {values.longitude}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card className="overflow-hidden border border-muted">
        <div className="bg-muted px-4 py-2 border-b border-muted flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Features</h3>
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Sports Types</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedSportsTypes.length > 0 ? (
                selectedSportsTypes.map((sport, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                  >
                    {sport}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No sports types selected</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Amenities</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedAmenities.length > 0 ? (
                selectedAmenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                  >
                    {amenity}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No amenities selected</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owner Section */}
      <Card className="overflow-hidden border border-muted">
        <div className="bg-muted px-4 py-2 border-b border-muted flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Venue Owner</h3>
        </div>
        <CardContent className="p-4">
          <p className="font-medium">{ownerName}</p>
        </CardContent>
      </Card>

      {/* Images Section */}
      {values.images && values.images.length > 0 && (
        <Card className="overflow-hidden border border-muted">
          <div className="bg-muted px-4 py-2 border-b border-muted">
            <h3 className="text-sm font-medium">Venue Images</h3>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {values.images.map((image, index) => (
                <div key={index} className="aspect-video relative rounded-md overflow-hidden border">
                  <Image
                    src={image.url}
                    alt={`Venue image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back to Images
        </Button>
      </div>
    </div>
  );
}