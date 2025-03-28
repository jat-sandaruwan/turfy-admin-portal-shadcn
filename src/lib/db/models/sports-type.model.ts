import { Schema, model, Document, Model } from 'mongoose';

/**
 * Interface for the SportsType document.
 */
export interface ISportsType extends Document {
  name: string;
  icon?: string;
  createdAt?: Date;
}

/**
 * SportsType schema definition.
 */
const sportsTypeSchema = new Schema<ISportsType>({
  name: { type: String, required: true, unique: true },
  icon: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Create and export the SportsType model.
const SportsType: Model<ISportsType> = model<ISportsType>('SportsType', sportsTypeSchema);
export default SportsType;