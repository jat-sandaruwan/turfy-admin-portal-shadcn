import { Schema, model, Document, Model, Types } from 'mongoose';
import { IDiscount } from './discount.model';
import { IVenue } from './venue.model';
import { IFacility } from './facility.model';
import { IPayment } from './payment.model';
import { IUser } from './user.model';

export type BookingStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'confirmed'
  | 'payment_failed'
  | 'cancelled'
  | 'completed'
  | 'rejected';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type OriginType = 'system' | 'manual';

export interface IDiscountDetails {
  code?: string;
  value?: number;
}

export interface ITimeSegment {
  timeSlotStart: Date;
  timeSlotEnd: Date;
  quantity: number;
  basePrice: number;
  finalPrice: number;
  discountDetails?: IDiscountDetails;
}

export interface IAppliedDiscount {
  discount?: IDiscount;
  code?: string;
  type: 'automated' | 'coupon';
  valueType: 'percentage' | 'fixed';
  value: number;
  saving: number;
}

export interface IBooking extends Document {
  venue: IVenue;
  facility: IFacility;
  currency: string;
  customerName?: string;
  customerMobile?: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  segments: ITimeSegment[];
  subtotal: number;
  totalDiscount: number;
  bookingFee: number;
  bookingFeePercentage: number;
  venueCommission: number;
  venueCommissionPercentage: number;
  totalAmount: number;
  appliedDiscounts: IAppliedDiscount[];
  paymentIntentId?: string;
  payment?: IPayment;
  status: BookingStatus;
  approvalRequired: boolean;
  approvalStatus: ApprovalStatus;
  approvalNotes?: string;
  approvedBy?: IUser;
  approvedAt?: Date;
  additionalInfo?: string;
  createdBy: IUser;
  origin: OriginType;
  createdAt: Date;
  updatedAt: Date;
}

// Booking schema definition.
const bookingSchema = new Schema<IBooking>(
  {
    // Core booking fields
    venue: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
      index: true,
    },
    currency: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => /^[A-Z]{3}$/.test(value),
        message: "Invalid currency code. Use ISO 4217 codes (e.g., 'USD').",
      },
    },
    customerName: { type: String, trim: true },
    customerMobile: { type: String, trim: true },

    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },

    capacity: { type: Number, required: true, min: 1 },

    segments: [
      {
        timeSlotStart: { type: Date, required: true },
        timeSlotEnd: { type: Date, required: true },
        quantity: { type: Number, required: true },
        basePrice: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
        discountDetails: {
          code: { type: String },
          value: { type: Number },
        },
      },
    ],

    subtotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },

    bookingFee: { type: Number, default: 0 },
    bookingFeePercentage: { type: Number, default: 3 },
    venueCommission: { type: Number, default: 0 },
    venueCommissionPercentage: { type: Number, default: 10 },
    totalAmount: { type: Number, required: true },

    appliedDiscounts: [
      {
        discount: { type: Schema.Types.ObjectId, ref: 'Discount' },
        code: { type: String },
        type: {
          type: String,
          enum: ['automated', 'coupon'],
        },
        valueType: {
          type: String,
          enum: ['percentage', 'fixed'],
        },
        value: { type: Number },
        saving: { type: Number },
      },
    ],

    paymentIntentId: { type: String },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },

    status: {
      type: String,
      enum: [
        'pending',
        'awaiting_payment',
        'confirmed',
        'payment_failed',
        'cancelled',
        'completed',
        'rejected',
      ],
      default: 'awaiting_payment',
      index: true,
    },

    approvalRequired: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvalNotes: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },

    additionalInfo: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    origin: {
      type: String,
      enum: ['system', 'manual'],
      default: 'system',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to calculate duration in minutes.
bookingSchema.virtual('durationMinutes').get(function (this: IBooking) {
  return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
});

// Virtual to calculate final amount before fees.
bookingSchema.virtual('finalAmount').get(function (this: IBooking) {
  return this.subtotal - (this.totalDiscount || 0);
});

// Pre-save hook to ensure consistency.
bookingSchema.pre<IBooking>('save', function (next) {
  // Ensure at least one segment exists.
  if (!this.segments || this.segments.length === 0) {
    return next(new Error('At least one segment is required'));
  }

  // Sort segments to automatically set startTime and endTime if not provided.
  if (!this.startTime || !this.endTime) {
    const sortedSegments = [...this.segments].sort(
      (a, b) => new Date(a.timeSlotStart).getTime() - new Date(b.timeSlotStart).getTime()
    );
    this.startTime = sortedSegments[0].timeSlotStart;
    this.endTime = sortedSegments[sortedSegments.length - 1].timeSlotEnd;
  }

  // Ensure all segments have identical quantity and match the capacity.
  const firstSegmentQuantity = this.segments[0].quantity;
  const equalQuantity = this.segments.every(segment => segment.quantity === firstSegmentQuantity);
  if (!equalQuantity) {
    return next(new Error('All segments must have the same quantity'));
  }
  if (this.capacity !== firstSegmentQuantity) {
    return next(new Error('Capacity must match the quantity used in each segment'));
  }

  next();
});

// Useful indexes.
bookingSchema.index({ venue: 1, startTime: -1 });
bookingSchema.index({ facility: 1, startTime: -1 });
bookingSchema.index({ createdBy: 1, startTime: -1 });
bookingSchema.index({ status: 1, startTime: -1 });

const Booking: Model<IBooking> = model<IBooking>('Booking', bookingSchema);
export default Booking;