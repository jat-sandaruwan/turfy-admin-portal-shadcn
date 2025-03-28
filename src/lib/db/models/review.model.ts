import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser } from './user.model';
import { IVenue } from './venue.model';
import { IFacility } from './facility.model';
import { IBooking } from './booking.model';

// -----------------------------------------------------------------------------
// Interfaces for subdocuments and main Review document

// Interface for review attributes
export interface IReviewAttributes {
  cleanliness?: number; // Rating 1-5
  value?: number;       // Rating 1-5
  staff?: number;       // Rating 1-5
  amenities?: number;   // Rating 1-5
}

// Interface for verification details subdocument
export interface IVerificationDetails {
  bookingDate?: Date;
  verified: boolean;
}

// Interface for a report subdocument
export interface IReport {
  user: IUser;
  reason?: string;
  date?: Date;
}

// Main Review document interface
export interface IReview extends Document {
  user: IUser;        // Reference to the reviewing User
  venue: IVenue;       // Reference to the Venue being reviewed
  facility: IFacility;    // Reference to the Facility being reviewed
  booking: IBooking;     // Reference to the Booking which is under review
  rating: number;              // Overall rating (1-5)
  title?: string;              // Optional review title
  comment?: string;            // Optional comment (max 1000 characters)
  attributes?: IReviewAttributes; // Detailed ratings for specific attributes
  verificationDetails?: IVerificationDetails; // Verification data for review
  helpfulCount: number;
  reports?: IReport[];
  flaggedForModeration: boolean;
  edited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Review model statics
export interface IReviewModel extends Model<IReview> {
  getVenueRating(venueId: Types.ObjectId | string): Promise<{ average: number; count: number }>;
}

// -----------------------------------------------------------------------------
// Define Review Schema

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
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
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    title: {
      type: String,
      maxlength: 100,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    attributes: {
      cleanliness: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
      staff: { type: Number, min: 1, max: 5 },
      amenities: { type: Number, min: 1, max: 5 },
    },
    verificationDetails: {
      bookingDate: { type: Date },
      verified: { type: Boolean, default: true },
    },
    helpfulCount: { type: Number, default: 0 },
    reports: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        date: Date,
      },
    ],
    flaggedForModeration: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }
);

// -----------------------------------------------------------------------------
// Indexes for common queries
reviewSchema.index({ venue: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ flaggedForModeration: 1 }, { sparse: true });

// -----------------------------------------------------------------------------
// Static method to get venue stats (average rating and review count)
reviewSchema.statics.getVenueRating = async function (
  venueId: Types.ObjectId | string
) {
  const stats = await this.aggregate([
    { $match: { venue: new mongoose.Types.ObjectId(venueId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  return stats.length > 0
    ? {
        average: parseFloat(stats[0].averageRating.toFixed(1)),
        count: stats[0].reviewCount,
      }
    : { average: 0, count: 0 };
};

// -----------------------------------------------------------------------------
// Pre-save validation to ensure only completed bookings can be reviewed
reviewSchema.pre<IReview>("save", async function (next) {
  if (this.isNew) {
    // Dynamically retrieve the Booking model to perform checks
    const Booking = mongoose.model("Booking");
    const booking = await Booking.findById(this.booking);

    if (!booking) {
      return next(new Error("Review must be associated with a valid booking"));
    }

    // @ts-ignore: Ensure booking.status is accessible. Adjust interface as needed.
    if (booking.status !== "completed") {
      return next(new Error("Only completed bookings can be reviewed"));
    }

    // Ensure the reviewing user is the one who made the booking
    // @ts-ignore: Ensure booking.createdBy is accessible. Adjust interface as needed.
    if (!booking.createdBy.equals(this.user)) {
      return next(new Error("Only the user who made the booking can leave a review"));
    }
  }

  next();
});

// -----------------------------------------------------------------------------
// Create and export the Review model
const Review: IReviewModel = mongoose.model<IReview, IReviewModel>("Review", reviewSchema);
export default Review;