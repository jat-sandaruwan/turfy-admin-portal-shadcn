import { Schema, model, Document, Model, Types, models } from 'mongoose';
import { IFacility } from './facility.model';
import { IUser, IVenueOwner } from './user.model';

export interface IVenue extends Document {
  owner: IVenueOwner;
  name: string;
  description?: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: number[]; // [longitude, latitude]
  };
  facilities: IFacility[];
  commissionPercentage: number;
  amenities: string[];
  sportsTypes: string[];
  images: string[];
  isEnabled: boolean;
  country: string;
  currency: string;
  managers: {
    user: IUser;
    role: 'manager' | 'assistant' | 'staff';
  }[];
  status: 'pending' | 'approved' | 'rejected';
  stripeAccountId?: string | null;
  stripeOnboardingComplete: boolean;
  ratingAverage: number;
  ratingCount: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const venueSchema = new Schema<IVenue>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    facilities: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Facility',
      },
    ],
    commissionPercentage: { type: Number, required: true, min: 0, max: 100 },
    amenities: { type: [String], default: [] },
    sportsTypes: { type: [String], default: [] },
    images: [{ type: String }],
    isEnabled: { type: Boolean, default: true },
    country: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => /^[A-Z]{2}$/.test(value),
        message: "Invalid country code. Use ISO 3166-1 alpha-2 codes (e.g., 'US').",
      },
    },
    currency: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => /^[A-Z]{3}$/.test(value),
        message: "Invalid currency code. Use ISO 4217 codes (e.g., 'USD').",
      },
    },
    managers: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['manager', 'assistant', 'staff'],
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    stripeAccountId: {
      type: String,
      default: null,
    },
    stripeOnboardingComplete: {
      type: Boolean,
      default: false,
    },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Create a 2dsphere index on location to support geospatial queries.
venueSchema.index({ location: '2dsphere' }, { name: 'location_2dsphere' });
venueSchema.index({ owner: 1 });
venueSchema.index({ status: 1 });

// Check if the model already exists before creating a new one
const Venue: Model<IVenue> = models.Venue || model<IVenue>('Venue', venueSchema);
export default Venue;