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
import { Textarea } from "@/components/ui/textarea";
import { VenueFormValues } from "@/app/dashboard/venues/create/types";

interface DetailsTabContentProps {
  form: UseFormReturn<VenueFormValues>;
  onNext: () => void;
}

export function DetailsTabContent({ form, onNext }: DetailsTabContentProps) {
  return (
    <div className="space-y-4 mt-0">
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
        <Button type="button" onClick={onNext}>
          Next: Location
        </Button>
      </div>
    </div>
  );
}