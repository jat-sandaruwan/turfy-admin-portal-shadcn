import { Schema, model, Document, Model, Types } from 'mongoose';
import { IVenue } from './venue.model';
import { IFacility } from './facility.model';

// Define allowed holiday types.
export type HolidayType = 'public' | 'private' | 'maintenance';

// Interface for recurring holidays date.
export interface IRecurringDate {
    month: number; // 1-12
    day: number; // 1-31
}

// Interface for custom operating hours.
export interface IOperatingHours {
    startTime: string; // Format: "HH:mm", e.g., "09:00"
    endTime: string;   // Format: "HH:mm", e.g., "17:00"
}

// Main Holiday document interface.
export interface IHoliday extends Document {
    venue: IVenue;
    name: string;
    type: HolidayType;
    date?: Date; // One-time holiday
    recurringDate?: IRecurringDate; // Recurring holiday (optional)
    facilities: IFacility[];
    operatingHours?: IOperatingHours[]; // Custom hours for partial closures
    isFullDayClosure: boolean;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const holidaySchema = new Schema<IHoliday>(
    {
        venue: {
            type: Schema.Types.ObjectId,
            ref: 'Venue',
            required: true,
        },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['public', 'private', 'maintenance'],
            default: 'public',
        },
        date: { type: Date },
        recurringDate: {
            month: { type: Number },
            day: { type: Number },
        },
        facilities: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Facility',
            },
        ],
        operatingHours: [
            {
                startTime: { type: String },
                endTime: { type: String },
            },
        ],
        isFullDayClosure: { type: Boolean, default: true },
        notes: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to update the updatedAt field on every save.
holidaySchema.pre<IHoliday>('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Holiday: Model<IHoliday> = model<IHoliday>('Holiday', holidaySchema);
export default Holiday;