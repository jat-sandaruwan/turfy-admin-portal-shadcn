import { Schema, model, Document, Model } from 'mongoose';

/**
 * Interface for the Amenity document.
 */
export interface IAmenity extends Document {
  name: string;
  value: string;
  // Using a Map to store icon keys and values.
  icon: Map<string, string>;
}

/**
 * Defines the Amenity schema.
 * - name: The display name of the amenity.
 * - value: A unique identifier for the amenity.
 * - icon: A Map storing icon values (could be URLs or icon class names).
 */
const amenitySchema = new Schema<IAmenity>({
  name: { type: String, required: true },
  value: { type: String, required: true, unique: true },
  icon: { type: Map, of: String },
});

// Create and export the Amenity model.
const Amenity: Model<IAmenity> = model<IAmenity>('Amenity', amenitySchema);
export default Amenity;