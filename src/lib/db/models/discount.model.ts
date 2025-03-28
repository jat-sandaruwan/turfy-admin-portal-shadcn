import { Schema, model, Document, Model, Types } from 'mongoose';
import { IVenue } from './venue.model';
import { IFacility } from './facility.model';
import { IBooking } from './booking.model';
import { IUser } from './user.model';

export type DiscountType = 'percentage' | 'fixed_amount';
export type DiscountScope = 'venue' | 'facility';
export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface ITimeSlot {
  startTime: string; // Format "HH:mm"
  endTime: string;   // Format "HH:mm"
}

export interface IUsageHistory {
  booking?: IBooking;
  user?: IUser;
  usedAt: Date;
  amountDiscounted: number;
}

export interface IDiscount extends Document {
  code: string;
  name: string;
  description?: string;

  // Discount Type and Value
  type: DiscountType;
  value: number;

  // Applicability
  scope: DiscountScope;
  venue: IVenue;
  facility?: IFacility;

  // Usage Limits
  maxUses?: number;
  usedCount: number;
  maxUsesPerUser: number;
  minBookingAmount?: number;

  // Validity
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;

  // Restrictions
  daysOfWeek?: DayOfWeek[];
  timeSlots?: ITimeSlot[];

  // Usage Tracking
  usageHistory: IUsageHistory[];

  createdAt: Date;
  updatedAt: Date;
}

const discountSchema = new Schema<IDiscount>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: { type: String, required: true },
    description: { type: String },

    // Discount Type and Value
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount'],
      required: true,
    },
    value: { type: Number, required: true },

    // Applicability
    scope: {
      type: String,
      enum: ['venue', 'facility'],
      required: true,
    },
    venue: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
    },

    // Usage Limits
    maxUses: { type: Number },
    usedCount: { type: Number, default: 0 },
    maxUsesPerUser: { type: Number, default: 1 },
    minBookingAmount: { type: Number },

    // Validity
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },

    // Restrictions
    daysOfWeek: [
      {
        type: String,
        enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      },
    ],
    timeSlots: [
      {
        startTime: { type: String }, // Format: HH:mm
        endTime: { type: String },   // Format: HH:mm
      },
    ],

    // Usage Tracking
    usageHistory: [
      {
        booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        usedAt: { type: Date, default: Date.now },
        amountDiscounted: { type: Number },
      },
    ],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to update the updatedAt timestamp.
discountSchema.pre<IDiscount>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Custom validator for the discount 'value' field.
discountSchema.path('value').validate(function (value: number) {
  if (this.type === 'percentage') {
    return value > 0 && value <= 100;
  }
  return value > 0;
}, 'Invalid discount value');

const Discount: Model<IDiscount> = model<IDiscount>('Discount', discountSchema);
export default Discount;