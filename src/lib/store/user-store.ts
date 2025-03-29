import { create } from 'zustand';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';

interface UserState {
  user: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  } | null;
  isLoading: boolean;
  updateUserFromSession: (session: Session | null) => void;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  
  updateUserFromSession: (session) => {
    if (!session || !session.user) {
      set({ user: null, isLoading: false });
      return;
    }

    set({
      user: {
        id: session.user.id,
        name: session.user.name || undefined,
        email: session.user.email || undefined,
        image: session.user.image || undefined,
        role: session.user.role || 'user',
      },
      isLoading: false,
    });
  },

  logout: async () => {
    try {
      await signOut({ redirect: false });
      set({ user: null });
      return Promise.resolve();
    } catch (error) {
      console.error("Error during logout:", error);
      return Promise.reject(error);
    }
  },
}));