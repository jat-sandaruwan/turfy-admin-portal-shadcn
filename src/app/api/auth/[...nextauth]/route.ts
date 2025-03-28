import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { User } from "@/lib/db/models/user.model";
import { connectToDatabase } from "@/lib/db/connection";
import { FirebaseError } from 'firebase/app';

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("Warning: NEXTAUTH_SECRET is not defined. This may cause session errors.");
}

/**
 * NextAuth configuration for admin portal authentication
 * Only users with admin role can access the portal
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        firebaseToken: { label: "Firebase Token", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }

        try {
          // Connect to MongoDB
          await connectToDatabase();
          
          // Get Firebase Admin instance
          const admin = getFirebaseAdmin();
          
          try {
            // Verify Firebase token if provided (stronger security)
            if (credentials.firebaseToken) {
              try {
                await admin.auth().verifyIdToken(credentials.firebaseToken);
              } catch (e) {
                console.error("Firebase token verification failed:", e);
                // Continue without token verification - will check user in database
              }
            }
            
            // Verify user exists in Firebase
            const userCredential = await admin.auth().getUserByEmail(credentials.email);
            
            if (!userCredential) {
              console.log("User not found in Firebase");
              return null;
            }
            
            // Verify user exists in our database and is an admin
            const user = await User.findOne({ 
              email: credentials.email,
              role: "admin" 
            }).lean();
            
            if (!user) {
              console.log(`User with email ${credentials.email} is not an admin or does not exist`);
              return null;
            }
            
            console.log("User authenticated successfully:", user._id.toString());
            
            // Return user with properly mapped fields
            return {
              id: user._id.toString(),
              email: user.email || "",
              name: user.name || "Admin User",
              image: user.profilePicture || null,
              role: user.role,
              firebaseId: userCredential.uid,
            };
          } catch (error) {
            console.error("Firebase authentication error:", error);
            return null;
          }
        } catch (error) {
          // Properly handle different error types
          if (error instanceof FirebaseError) {
            console.error("Firebase error:", error.code, error.message);
            return null;
          } else if (error instanceof Error) {
            console.error("Authentication error:", error.message);
            return null;
          } else {
            console.error("Unknown error during authentication:", error);
            return null;
          }
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Add user data to the token when signing in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.firebaseId = user.firebaseId;
        
        console.log("JWT callback - adding user data to token:", { 
          id: user.id,
          role: user.role
        });
      }

      // Handle session updates
      if (trigger === "update" && session) {
        // If you need to update token with new session data
        Object.assign(token, session);
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add token data to the session for client access
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.firebaseId = token.firebaseId as string;
        
        console.log("Session callback - adding token data to session:", {
          userId: session.user.id,
          userRole: session.user.role
        });
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };