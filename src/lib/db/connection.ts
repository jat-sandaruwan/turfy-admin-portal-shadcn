import mongoose from 'mongoose';

/**
 * Global mongoose connection object
 * MongoDB URI is required and fetched from environment variables
 */
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global connection interface definition
 */
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached: MongooseConnection = (global as any).mongoose || { conn: null, promise: null };

if (!(global as any).mongoose) {
  (global as any).mongoose = cached;
}

/**
 * Connect to MongoDB with connection pooling and caching
 * Using a singleton pattern to prevent multiple connections during development
 * with hot reloading
 * 
 * @returns Promise of mongoose instance
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // If connection exists, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('MongoDB: Creating new connection...');
    
    // Save the promise in the cache
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB: Connected successfully');
      return mongoose;
    });
  }

  try {
    // Await the existing promise
    const mongoose = await cached.promise;
    cached.conn = mongoose;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Global type declarations for TypeScript
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection | undefined;
}
