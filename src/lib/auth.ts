import { authOptions as nextAuthOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Re-export the auth options from the NextAuth route handler
 * This allows importing auth configuration across the application
 * without creating duplicate definitions
 */
export const authOptions = nextAuthOptions;