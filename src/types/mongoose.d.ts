import mongoose from 'mongoose';

// Add Mongoose to the NodeJS global type
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

// Generic document type with TypeScript support
export type DocumentType<T> = mongoose.Document & T;

// Generic model type
export type ModelType<T> = mongoose.Model<DocumentType<T>>;
