/**
 * Database configuration settings
 */
export const dbConfig = {
  // Default collection options
  collectionOptions: {
    timestamps: true,
    versionKey: false,
  },
  
  // Connection options
  connectionOptions: {
    autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in development, but not in production for performance
    maxPoolSize: 10, // Maintain up to 10 socket connections
  }
};
