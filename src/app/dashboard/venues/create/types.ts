import * as z from "zod";

// Define form schema with Zod
export const venueFormSchema = z.object({
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

export type VenueFormValues = z.infer<typeof venueFormSchema>;

export interface SportsType {
  _id: string;
  name: string;
  icon?: string;
}

export interface Amenity {
  _id: string;
  name: string;
  value: string;
  icon?: Map<string, string>;
}