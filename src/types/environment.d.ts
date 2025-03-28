declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    MONGODB_URI: string; // MongoDB connection string
    NEXT_PUBLIC_FIREBASE_API_KEY: string; // Firebase API key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string; // Firebase Auth domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string; // Firebase project ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string; // Firebase storage bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string; // Firebase messaging sender ID
    NEXT_PUBLIC_FIREBASE_APP_ID: string; // Firebase app ID
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string; // Google Maps API key
    FIREBASE_CLIENT_EMAIL: string; // Firebase client email
    FIREBASE_PRIVATE_KEY: string; // Firebase private key
    FIREBASE_AUTH_URI: string; // Firebase auth URI
    FIREBASE_TOKEN_URI: string; // Firebase token URI
    NEXTAUTH_SECRET: string; // NextAuth secret for JWT signing
    NEXTAUTH_URL: string; // NextAuth URL for redirects
  }
}
