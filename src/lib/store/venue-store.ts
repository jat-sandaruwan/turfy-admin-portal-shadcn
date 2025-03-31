import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VenueState {
  activeVenueId: string | null;
  activeVenueName: string | null;
  setActiveVenue: (id: string | null, name: string | null) => void;
}

export const useVenueStore = create<VenueState>()(
  persist(
    (set) => ({
      activeVenueId: null,
      activeVenueName: null,
      setActiveVenue: (id, name) => set({ activeVenueId: id, activeVenueName: name }),
    }),
    {
      name: 'venue-storage',
    }
  )
);