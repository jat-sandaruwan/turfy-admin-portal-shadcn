"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { VenueFormValues } from "@/app/dashboard/venues/create/types";

interface SportsType {
  _id: string;
  name: string;
  icon?: string;
}

interface Amenity {
  _id: string;
  name: string;
  value: string;
  icon?: Map<string, string>;
}

interface FeaturesTabContentProps {
  form: UseFormReturn<VenueFormValues>;
  onBack: () => void;
  onNext: () => void; // Add this new prop
  isSubmitting: boolean;
  isLoadingOwners: boolean;
  isLoadingSportsTypes: boolean;
  isLoadingAmenities: boolean;
  sportsTypes: SportsType[];
  amenities: Amenity[];
  venueOwners: { id: string; name: string }[];
}

export function FeaturesTabContent({
  form,
  onBack,
  onNext, // Add this to props destructuring
  isSubmitting,
  isLoadingOwners,
  isLoadingSportsTypes,
  isLoadingAmenities,
  sportsTypes,
  amenities,
  venueOwners,
}: FeaturesTabContentProps) {
  return (
    <div className="space-y-4 mt-0">
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

            {isLoadingSportsTypes ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading sports types...</span>
              </div>
            ) : sportsTypes.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 border rounded-md">
                No sports types found. Please add some in the database.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {sportsTypes.map((sport) => (
                  <FormItem
                    key={sport._id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-1"
                        checked={field.value?.includes(sport._id)}
                        onChange={(e) => {
                          const updatedValue = e.target.checked
                            ? [...(field.value || []), sport._id]
                            : field.value?.filter((id) => id !== sport._id) || [];
                          field.onChange(updatedValue);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center">
                      {sport.icon && <span className="mr-1">{sport.icon}</span>}
                      {sport.name}
                    </FormLabel>
                  </FormItem>
                ))}
              </div>
            )}
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

            {isLoadingAmenities ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading amenities...</span>
              </div>
            ) : amenities.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 border rounded-md">
                No amenities found. Please add some in the database.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {amenities.map((amenity) => (
                  <FormItem
                    key={amenity._id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-1"
                        checked={field.value?.includes(amenity.value)}
                        onChange={(e) => {
                          const updatedValue = e.target.checked
                            ? [...(field.value || []), amenity.value]
                            : field.value?.filter((value) => value !== amenity.value) || [];
                          field.onChange(updatedValue);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{amenity.name}</FormLabel>
                  </FormItem>
                ))}
              </div>
            )}
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
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingOwners}>
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
            <FormDescription>The owner of this venue.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next: Images
        </Button>
      </div>
    </div>
  );
}