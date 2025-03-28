import mongoose, { Schema, Document, Model } from 'mongoose';
import admin from 'firebase-admin';
import { IVenue } from './venue.model';

/**
 * Interface for the base User document.
 */
export interface IUser extends Document {
  firebaseId: string;
  name: string;
  email?: string;
  profilePicture?: string;
  role: 'customer' | 'venue-owner' | 'admin';
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Extend IUser for a VenueOwner.
 */
export interface IVenueOwner extends IUser {
  country: string;
  currency: string;
  activeVenueId?: IVenue;
}

/**
 * Extend IUser for a Customer.
 */
export interface ICustomer extends IUser {
  username: string;
  phoneNumber: string;
}

/**
 * Extend IUser for an Admin.
 */
export interface IAdmin extends IUser {
  permissions: string[];
}

// Define the base user schema
const userSchema = new Schema<IUser>(
  {
    firebaseId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { 
      type: String, 
      unique: true, 
      sparse: true, // Allows null/undefined values without violating the unique constraint
      match: /.+\@.+\..+/, // Basic email validation
    },
    profilePicture: { type: String, default: '' },
    role: {
      type: String,
      enum: ['customer', 'venue-owner', 'admin'],
      required: true,
    },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Post-save hook to set Firebase custom claims
userSchema.post('save', async function (doc: IUser) {
  try {
    // Cast _id to a mongoose ObjectId to avoid type issues
    const userId = (doc._id as mongoose.Types.ObjectId).toString();
    
    // Define custom claims based on user role
    const claims: any = {
      role: doc.role,
      userId,
    };

    // If the user is a venue owner, add additional claims.
    if (doc.role === 'venue-owner') {
      // Note: The following fields are defined on the VenueOwner discriminator.
      const venueOwner = doc as IVenueOwner;
      claims.country = venueOwner.country || null;
      claims.currency = venueOwner.currency || null;
      claims.activeVenueId = venueOwner.activeVenueId
        ? venueOwner.activeVenueId.toString()
        : null;
    }

    // Set custom claims in Firebase Auth
    await admin.auth().setCustomUserClaims(doc.firebaseId, claims);
    console.log(`Custom claims set for user ${doc.email} with role ${doc.role}`);
  } catch (error) {
    console.error('Error setting custom claims in Firebase:', error);
  }
});

// VenueOwner schema extension
const venueOwnerSchemaFields: Record<keyof Omit<IVenueOwner, keyof IUser>, any> = {
  country: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => /^[A-Z]{2}$/.test(value), // ISO 3166-1 alpha-2
      message: "Invalid country code. Use ISO 3166-1 alpha-2 codes (e.g., 'US').",
    },
  },
  currency: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => /^[A-Z]{3}$/.test(value), // ISO 4217 currency code
      message: "Invalid currency code. Use ISO 4217 codes (e.g., 'USD').",
    },
  },
  activeVenueId: {
    type: Schema.Types.ObjectId,
    ref: 'Venue',
    default: null,
  },
};

const venueOwnerSchema = new Schema<IVenueOwner>(venueOwnerSchemaFields);

// Customer schema extension
const customerSchemaFields: Record<keyof Omit<ICustomer, keyof IUser>, any> = {
  username: { type: String, required: true, unique: true },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: (value: string) => !!value && value.trim() !== '',
      message: 'Phone number is required for customers.',
    },
  },
};

const customerSchema = new Schema<ICustomer>(customerSchemaFields);

// Admin schema extension
const adminSchemaFields: Record<keyof Omit<IAdmin, keyof IUser>, any> = {
  permissions: { type: [String], default: [] },
};

const adminSchemaExtension = new Schema<IAdmin>(adminSchemaFields);

/**
 * Mongoose model factory with singleton pattern to prevent 
 * "OverwriteModelError: Cannot overwrite model once compiled" errors
 * in Next.js App Router with hot reloading.
 */
const models = mongoose.models;

// Create the base User model (using singleton pattern)
export const User = (models.User || mongoose.model<IUser>('User', userSchema)) as Model<IUser>;

// Create the VenueOwner discriminator (using singleton pattern)
export const VenueOwner = (models.VenueOwner || 
  User.discriminator<IVenueOwner>('VenueOwner', venueOwnerSchema)) as Model<IVenueOwner>;

// Create the Customer discriminator (using singleton pattern)
export const Customer = (models.Customer || 
  User.discriminator<ICustomer>('Customer', customerSchema)) as Model<ICustomer>;

// Create the Admin discriminator (using singleton pattern)
export const Admin = (models.Admin || 
  User.discriminator<IAdmin>('Admin', adminSchemaExtension)) as Model<IAdmin>;