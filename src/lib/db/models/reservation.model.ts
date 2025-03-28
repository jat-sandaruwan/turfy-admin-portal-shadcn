import { Schema, model, Document, Model, Types } from 'mongoose';
import { IFacility } from './facility.model';
import { IVenue } from './venue.model';
import { IUser } from './user.model';
import { IBooking } from './booking.model';

// -------------------------------------------------------------------------
// Interfaces for subdocuments and main Reservation document

// Interface for discount details in a segment
export interface IDiscountDetails {
  code?: string;
  value?: number;
}

// Interface for an individual segment in a reservation
export interface IReservationSegment {
  timeSlotStart: Date;
  timeSlotEnd: Date;
  basePrice: number;
  finalPrice: number;
  quantity: number;
  discountDetails?: IDiscountDetails;
}

// Main Reservation document interface
export interface IReservation extends Document {
  facility: IFacility;
  venue: IVenue;
  startTime: Date;
  endTime: Date;
  capacity: number;
  currency: 'GBP' | 'USD' | 'EUR' | 'CAD' | 'AUD' | 'INR';
  segments: IReservationSegment[];
  subtotal: number;
  totalDiscount: number;
  finalAmount: number;
  bookingFee: number;
  bookingFeePercentage: number;
  venueCommission: number;
  venueCommissionPercentage: number;
  totalAmount?: number;
  discountCode?: string;
  discountValue?: number;
  user: IUser;
  expiresAt: Date;
  booking?: IBooking;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  // Virtual property
  durationMinutes?: number;
}

// -------------------------------------------------------------------------
// Define Segment Schema (subdocument)

const segmentSchema = new Schema<IReservationSegment>(
  {
    timeSlotStart: { type: Date, required: true },
    timeSlotEnd: { type: Date, required: true },
    basePrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    // Optional - if this segment has its own discount
    discountDetails: {
      code: { type: String },
      value: { type: Number },
    },
  },
  { _id: false } // Disable _id for subdocuments
);

// -------------------------------------------------------------------------
// Define Reservation Schema

const reservationSchema = new Schema<IReservation>(
  {
    // Core reservation information
    facility: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
      index: true,
    },
    venue: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },

    // Top-level fields for easy querying
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },

    // Total capacity being reserved
    capacity: { type: Number, required: true, min: 1 },

    // Currency information
    currency: {
      type: String,
      required: true,
      default: 'GBP',
      enum: ['GBP', 'USD', 'EUR', 'CAD', 'AUD', 'INR'],
      uppercase: true,
      trim: true,
    },

    // Segments with detailed pricing
    segments: {
      type: [segmentSchema],
      required: true,
      validate: {
        validator(v: IReservationSegment[]) {
          return v && v.length > 0;
        },
        message: 'At least one segment is required',
      },
    },

    // Pricing Information
    subtotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },

    // Fee Information
    bookingFee: { type: Number, default: 0 },
    bookingFeePercentage: { type: Number, default: 3 },
    venueCommission: { type: Number, default: 0 },
    venueCommissionPercentage: { type: Number, default: 10 },

    // Total Amount including fees (optional as this might be calculated)
    totalAmount: { type: Number },

    // Discount Information
    discountCode: { type: String },
    discountValue: { type: Number, default: 0 },

    // User Information
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // TTL index - document will be automatically deleted after expiration
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },

    // If this reservation was used to create a booking
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },

    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'completed', 'expired', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Define useful indexes for common queries.
reservationSchema.index({ facility: 1, startTime: 1 });
reservationSchema.index({ venue: 1, startTime: 1 });
reservationSchema.index({ user: 1, createdAt: -1 });

// -------------------------------------------------------------------------
// Pre-save hook to ensure consistency

reservationSchema.pre<IReservation>('save', function (next) {
  // Ensure segments array has at least one element
  if (!this.segments || this.segments.length === 0) {
    return next(new Error('At least one segment is required'));
  }

  // If startTime or endTime not set, calculate them from segments.
  if (!this.startTime || !this.endTime) {
    const sortedSegments = [...this.segments].sort(
      (a, b) => a.timeSlotStart.getTime() - b.timeSlotStart.getTime()
    );
    this.startTime = sortedSegments[0].timeSlotStart;
    this.endTime = sortedSegments[sortedSegments.length - 1].timeSlotEnd;
  }

  // Ensure all segments have the same quantity.
  const firstSegmentQuantity = this.segments[0].quantity;
  const allSegmentsHaveSameQuantity = this.segments.every(
    (segment) => segment.quantity === firstSegmentQuantity
  );
  if (!allSegmentsHaveSameQuantity) {
    return next(new Error('All segments must have the same quantity'));
  }

  // Ensure capacity matches the quantity used in each segment.
  if (this.capacity !== firstSegmentQuantity) {
    return next(
      new Error('Capacity must match the quantity used in each segment')
    );
  }

  next();
});

// -------------------------------------------------------------------------
// Virtual property to calculate the duration in minutes

reservationSchema.virtual('durationMinutes').get(function (this: IReservation) {
  return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
});

// -------------------------------------------------------------------------
// Create and export the Reservation model

const Reservation: Model<IReservation> = model<IReservation>('Reservation', reservationSchema);
export default Reservation;