import { Schema, model, Document, Model, Types } from 'mongoose';
import { IVenue } from './venue.model';
import { ISportsType } from './sports-type.model';

export interface ITimeSegment {
  startTime: string; // Format "HH:mm", 24-hour format
  endTime: string;   // Format "HH:mm", 24-hour format
  basePrice?: number;
  capacity?: number;
  isAvailable?: boolean;
}

export interface IOperatingHours {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  segments: ITimeSegment[];
  isOpen: boolean;
}

export interface IBookingPolicy {
  autoAccept: boolean;
  minimumNoticePeriodHours: number;
  maximumAdvanceBookingDays: number;
  cancellationPolicyHours: number;
}

export interface IFacility extends Document {
  venue: IVenue;
  name: string;
  sportsTypes: ISportsType[];
  bookingPolicy: IBookingPolicy;
  capacity: number;
  capacityType: string;
  minBookingDurationMinutes: number;
  slotIncrementMinutes: number;
  maxBookingDurationMinutes?: number;
  operatingHours: IOperatingHours[];
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const facilitySchema = new Schema<IFacility>(
  {
    venue: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    name: { type: String, required: true },
    sportsTypes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'SportsType',
      },
    ],
    bookingPolicy: {
      autoAccept: { type: Boolean, default: true },
      minimumNoticePeriodHours: { type: Number, default: 2 },
      maximumAdvanceBookingDays: { type: Number, default: 30 },
      cancellationPolicyHours: { type: Number, default: 24 },
    },
    capacity: { type: Number, default: 1 },
    capacityType: { type: String, required: true },
    minBookingDurationMinutes: { type: Number, required: true },
    slotIncrementMinutes: { type: Number, default: 30 },
    maxBookingDurationMinutes: { type: Number },
    operatingHours: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          required: true,
        },
        segments: [
          {
            startTime: {
              type: String,
              required: true,
              validate: {
                validator: (v: string) => timeRegex.test(v),
                message: (props: any) => `${props.value} is not a valid time format (HH:mm)!`,
              },
            },
            endTime: {
              type: String,
              required: true,
              validate: {
                validator: (v: string) => timeRegex.test(v),
                message: (props: any) => `${props.value} is not a valid time format (HH:mm)!`,
              },
            },
            basePrice: { type: Number },
            capacity: { type: Number },
            isAvailable: { type: Boolean, default: true },
          },
        ],
        isOpen: { type: Boolean, default: true },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'maintenance', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Custom validator to ensure that time segments don't overlap for any operating day.
facilitySchema.path('operatingHours').validate(function (operatingHours: IOperatingHours[]) {
  return operatingHours.every((day) => {
    // Sort segments by startTime
    const segments = day.segments.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return segments.every((segment, i) => {
      if (i === 0) return true;
      return segment.startTime >= segments[i - 1].endTime;
    });
  });
}, 'Time segments cannot overlap');

// Indexes for optimized queries.
facilitySchema.index({ venue: 1 });
facilitySchema.index({ venue: 1, status: 1 });
facilitySchema.index({ sportsTypes: 1 });
facilitySchema.index({ sportsTypes: 1, status: 1 });
facilitySchema.index({ venue: 1, sportsTypes: 1, status: 1 });
facilitySchema.index({ status: 1 });
facilitySchema.index({ name: 'text' });

const Facility: Model<IFacility> = model<IFacility>('Facility', facilitySchema);
export default Facility;