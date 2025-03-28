import { create } from 'zustand';
import { auth } from '@/lib/firebase/client';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { signIn } from 'next-auth/react';

interface AuthResponse {
  success: boolean;
  error?: string;
}

interface AuthState {
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, remember: boolean) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  clearError: () => void;
}

/**
 * Authentication state store using Zustand
 * Handles login, forgot password, and error management
 */
export const useAuthStore = create<AuthState>((set) => ({
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string, remember: boolean): Promise<AuthResponse> => {
    set({ isLoading: true, error: null });
    
    try {
      // First authenticate with Firebase
      const firebaseResult = await signInWithEmailAndPassword(auth, email, password);
      
      if (!firebaseResult?.user) {
        throw new Error("Firebase authentication failed");
      }
      
      // Get Firebase token for additional security
      const firebaseToken = await firebaseResult.user.getIdToken();
      
      // Then authenticate with NextAuth
      const result = await signIn('credentials', {
        redirect: false, // Important: We'll handle redirection manually
        email,
        password,
        firebaseToken,
        callbackUrl: '/dashboard'
      });
      
      if (result?.error) {
        set({ error: result.error, isLoading: false });
        return { success: false, error: result.error };
      }
      
      set({ isLoading: false });
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.message || 'Failed to log in';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },
  
  forgotPassword: async (email: string): Promise<AuthResponse> => {
    set({ isLoading: true, error: null });
    
    try {
      await sendPasswordResetEmail(auth, email);
      set({ isLoading: false });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send password reset email';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },
  
  clearError: () => set({ error: null }),
}));