import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Define the map store state interface
interface MapState {
  markerPosition: google.maps.LatLngLiteral;
  userLocation: google.maps.LatLngLiteral | null;
  fetchingLocation: boolean;
  loading: boolean;
  geocoderResult: google.maps.GeocoderResult | null;
  
  // Actions
  setMarkerPosition: (position: google.maps.LatLngLiteral) => void;
  setUserLocation: (location: google.maps.LatLngLiteral | null) => void;
  setFetchingLocation: (fetching: boolean) => void;
  setLoading: (loading: boolean) => void;
  setGeocoderResult: (result: google.maps.GeocoderResult | null) => void;
}

// Default London coordinates
const defaultLocation = { lat: 51.5074, lng: -0.1278 };

// Create the map store with Zustand
export const useMapStore = create<MapState>()(
  devtools(
    (set) => ({
      markerPosition: defaultLocation,
      userLocation: null,
      fetchingLocation: false,
      loading: true,
      geocoderResult: null,
      
      // Actions to update state
      setMarkerPosition: (position) => set({ markerPosition: position }),
      setUserLocation: (location) => set({ userLocation: location }),
      setFetchingLocation: (fetching) => set({ fetchingLocation: fetching }),
      setLoading: (loading) => set({ loading: loading }),
      setGeocoderResult: (result) => set({ geocoderResult: result }),
    }),
    { name: 'map-store' }
  )
);