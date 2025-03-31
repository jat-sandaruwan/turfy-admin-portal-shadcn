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
import { Input } from "@/components/ui/input";
import GoogleMapSelector from "@/components/venues/GoogleMapSelector";
import { VenueFormValues } from "@/app/dashboard/venues/create/types";

interface LocationTabContentProps {
  form: UseFormReturn<VenueFormValues>;
  onBack: () => void;
  onNext: () => void;
  handleLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    countryCode: string;
    currency: string;
  }) => void;
}

export function LocationTabContent({
  form,
  onBack,
  onNext,
  handleLocationSelect,
}: LocationTabContentProps) {
  return (
    <div className="space-y-4 mt-0">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Venue Location</h3>
        <p className="text-sm text-muted-foreground">
          Select the venue location on the map. You can click on the map or drag the marker to set the exact location.
        </p>

        <GoogleMapSelector
          onLocationSelect={handleLocationSelect}
          initialLatitude={form.getValues("latitude") ? parseFloat(form.getValues("latitude")) : undefined}
          initialLongitude={form.getValues("longitude") ? parseFloat(form.getValues("longitude")) : undefined}
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
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next: Features & Owner
        </Button>
      </div>
    </div>
  );
}