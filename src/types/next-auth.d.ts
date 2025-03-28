import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      role: string;
      firebaseId: string;
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    role: string;
    firebaseId: string;
  }
}

/**
 * Extend the JWT token types
 */
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    firebaseId: string;
  }
}