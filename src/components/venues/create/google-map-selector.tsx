"use client";

import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search } from 'lucide-react';
import { toast } from "sonner";
import { 
  APIProvider, 
  Map, 
  Marker,
  useMap 
} from '@vis.gl/react-google-maps';
import { useMapStore } from '@/lib/store/map-store';
import React from 'react';
// Import the required packages
import countries from 'i18n-iso-countries';
import currencyCodes from 'currency-codes';

// Define the GoogleMapSelectorProps interface
interface GoogleMapSelectorProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    country: string;
    countryCode: string;
    currency: string;
  }) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

// Register English locale for country names
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

// Default currency to use when lookup fails
const DEFAULT_CURRENCY = 'USD';

// New asynchronous helper function to fetch currency data using REST Countries API
const fetchCurrencyFromCountry = async (countryCode: string): Promise<string> => {
  if (!countryCode) return DEFAULT_CURRENCY;
  try {
    // Call the REST Countries API with the provided country code
    const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    // The API returns currencies as an object with currency codes as keys
    if (data && data[0]?.currencies) {
      const keys = Object.keys(data[0].currencies);
      return keys.length > 0 ? keys[0] : DEFAULT_CURRENCY;
    }
    return DEFAULT_CURRENCY;
  } catch (error) {
    console.error('Error fetching currency from API:', error);
    return DEFAULT_CURRENCY;
  }
};

/**
 * PlacesAutocomplete component to replace the deprecated SearchBox
 * This is a child component that uses the map context from the parent
 */
function PlacesAutocomplete({ onPlaceSelect }: { 
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void 
}) {
  const map = useMap();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize the autocomplete when the map is available
  useEffect(() => {
    if (!map || !inputRef.current || !window.google?.maps?.places) return;

    try {
      // Create a new Autocomplete instance instead of SearchBox
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['address_components', 'geometry', 'formatted_address', 'name'],
        types: ['geocode', 'establishment']
      });
      
      autocompleteRef.current = autocomplete;

      // Bias the Autocomplete results towards current map's viewport
      map.addListener('bounds_changed', () => {
        if (autocomplete && map.getBounds()) {
          autocomplete.setBounds(map.getBounds()!);
        }
      });

      // Listen for the event fired when the user selects a prediction
      autocomplete.addListener('place_changed', () => {
        setIsSearching(true);
        
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          toast.error("No details available for this place");
          setIsSearching(false);
          return;
        }

        // If the place has a geometry, then present it on a map
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else if (place.geometry.location) {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        // Pass the selected place to the parent component
        onPlaceSelect(place);
        setIsSearching(false);
      });

      // Clean up
      return () => {
        if (map) {
          window.google.maps.event.clearListeners(map, 'bounds_changed');
        }
        if (autocomplete) {
          window.google.maps.event.clearListeners(autocomplete, 'place_changed');
        }
      };
    } catch (error) {
      console.error("Error initializing places autocomplete:", error);
      toast.error("Failed to initialize location search");
    }
  }, [map, onPlaceSelect]);

  // Handle key down event to prevent form submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // The autocomplete will handle the selection
    }
  };

  return (
    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 w-[90%] max-w-md">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for location..."
          className="pr-10 bg-white/90 backdrop-blur-sm shadow-md border-gray-300 focus:border-primary text-black"
          onKeyDown={handleKeyDown}
          aria-label="Search for a location"
        />
        {isSearching ? (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

/**
 * Component to handle geocoding operations
 * This component handles geocoding operations through the useMap hook
 */
function GeocoderService({
  position,
  onResult
}: {
  position: google.maps.LatLngLiteral;
  onResult: (result: google.maps.GeocoderResult | null) => void;
}) {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !window.google?.maps) return;
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          onResult(results[0]);
        } else {
          console.warn("Geocoding failed:", status);
          onResult(null);
        }
      });
    } catch (error) {
      console.error("Error during geocoding:", error);
      onResult(null);
    }
  }, [map, position, onResult]);
  
  return null; // This component doesn't render anything
}

/**
 * GoogleMapSelector component
 * Allows selecting a location on Google Maps and returns the coordinates,
 * address, country, and currency information.
 * Uses Zustand for state management per project requirements.
 */
export default function GoogleMapSelector({
  onLocationSelect,
  initialLatitude,
  initialLongitude,
}: GoogleMapSelectorProps) {
  // API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  // Use map store from Zustand
  const { 
    markerPosition, 
    userLocation, 
    fetchingLocation, 
    loading, 
    geocoderResult,
    setMarkerPosition,
    setUserLocation,
    setFetchingLocation,
    setLoading,
    setGeocoderResult
  } = useMapStore();
  
  // Initialize marker position with props values if provided
  useEffect(() => {
    if (initialLatitude !== undefined && initialLongitude !== undefined) {
      setMarkerPosition({ lat: initialLatitude, lng: initialLongitude });
    }
  }, [initialLatitude, initialLongitude, setMarkerPosition]);

  // Process geocoding result and extract location information
  const processGeocodingResult = async (
    result: google.maps.GeocoderResult | null, 
    position: google.maps.LatLngLiteral
  ) => {
    if (!result) {
      toast.error("Couldn't retrieve address information for this location");
      return;
    }
    
    try {
      const address = result.formatted_address || '';
      
      // Extract country and country code
      let country = '';
      let countryCode = '';
      
      for (const component of result.address_components) {
        if (component.types.includes('country')) {
          country = component.long_name;
          countryCode = component.short_name;
          break;
        }
      }
      
      // Await the asynchronous fetch for currency data
      const currency = await fetchCurrencyFromCountry(countryCode);
      
      // Debug logging
      console.log('Location selected:', {
        lat: position.lat,
        lng: position.lng,
        address,
        country,
        countryCode,
        currency
      });
      
      // Call the callback with location details
      onLocationSelect({
        latitude: position.lat,
        longitude: position.lng,
        address,
        country,
        countryCode,
        currency
      });
    } catch (error) {
      console.error("Error processing geocoding result:", error);
      toast.error("Error processing location data");
    }
  };

  // Effect to process geocoder results when they change
  useEffect(() => {
    if (geocoderResult) {
      (async () => {
        await processGeocodingResult(geocoderResult, markerPosition);
      })();
    }
  }, [geocoderResult, markerPosition, onLocationSelect]);

  // Get user's current location with error handling
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setFetchingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setMarkerPosition(location);
        setFetchingLocation(false);
      },
      // Error callback with improved error handling
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        
        // Extract more specific error information
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access was denied. Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please try again later.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        
        // Log detailed error information
        console.error("Geolocation error:", {
          code: error.code,
          message: error.message,
          details: errorMessage
        });
        
        toast.error(errorMessage);
        setFetchingLocation(false);
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 0
      }
    );
  };

  // Try to get user location on first load if no initial coordinates
  useEffect(() => {
    if (initialLatitude === undefined && initialLongitude === undefined) {
      try {
        getUserLocation();
      } catch (error) {
        console.error("Failed to get user location on load:", error);
      }
    }
  }, [initialLatitude, initialLongitude]);
  
  // Handle map click
  const handleMapClick = (event: any) => {
    // Access the native event to get latLng
    const nativeEvent = event.detail?.nativeEvent;
    if (nativeEvent?.latLng) {
      const position = {
        lat: nativeEvent.latLng.lat(),
        lng: nativeEvent.latLng.lng()
      };
      
      setMarkerPosition(position);
    }
  };
  
  // Handle place selection from search box
  const handlePlaceSelect = async (place: google.maps.places.PlaceResult) => {
    if (!place.geometry || !place.geometry.location) {
      toast.error("No location information available for this place");
      return;
    }

    // Get place location and update marker
    const position = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };
    
    setMarkerPosition(position);
    
    // Use the place details directly instead of geocoding again
    const address = place.formatted_address || '';
    let country = '';
    let countryCode = '';
    
    // Extract country information from address components
    if (place.address_components) {
      for (const component of place.address_components) {
        if (component.types.includes('country')) {
          country = component.long_name;
          countryCode = component.short_name;
          break;
        }
      }
    }
    
    // Await the API call to fetch currency
    const currency = await fetchCurrencyFromCountry(countryCode);
    
    // Debug logging
    console.log('Place selected:', {
      lat: position.lat,
      lng: position.lng,
      address,
      country,
      countryCode,
      currency
    });
    
    // Call the callback with location details
    onLocationSelect({
      latitude: position.lat,
      longitude: position.lng,
      address,
      country,
      countryCode,
      currency
    });
  };

  // If API key is missing, show error
  if (!apiKey) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500">
          Google Maps API key is missing. Please check your environment variables.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <Card className="p-1 min-h-[400px] w-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading map...</span>
          </div>
        )}
        
        <APIProvider apiKey={apiKey} libraries={["places"]}>
          <div className="h-[400px] w-full relative">
            <Map
              defaultCenter={markerPosition}
              defaultZoom={15}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapTypeControl={false}
              streetViewControl={false}
              fullscreenControl={false}
              onClick={handleMapClick}
              onTilesLoaded={() => setLoading(false)}
            >
              {/* Places Autocomplete component (replacing SearchBox) */}
              <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} />
              
              {/* Geocoder service component */}
              <GeocoderService
                position={markerPosition}
                onResult={setGeocoderResult}
              />
              
              {/* Location marker */}
              <Marker
                position={markerPosition}
                draggable={true}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    setMarkerPosition({
                      lat: e.latLng.lat(),
                      lng: e.latLng.lng()
                    });
                  }
                }}
              />
            </Map>
          </div>
        </APIProvider>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          onClick={getUserLocation}
          disabled={fetchingLocation}
          className="flex items-center gap-2"
        >
          {fetchingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          {fetchingLocation ? "Getting location..." : "Use my current location"}
        </Button>
      </div>
    </div>
  );
}