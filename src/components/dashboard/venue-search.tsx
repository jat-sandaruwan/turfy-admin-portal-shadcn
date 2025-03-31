"use client";

import * as React from "react";
import { Check, ChevronsUpDown, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useVenueStore } from "@/lib/store/venue-store";
import { useDebounce } from "@/hooks/use-debounce";

type Venue = {
  _id: string;
  name: string;
};

export function VenueSearch() {
  const [open, setOpen] = React.useState(false);
  const [venues, setVenues] = React.useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  
  const { activeVenueId, activeVenueName, setActiveVenue } = useVenueStore();
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Fetch venues when search query changes
  React.useEffect(() => {
    const fetchVenues = async () => {
      if (!debouncedSearchQuery) {
        setVenues([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/venues/search?q=${encodeURIComponent(debouncedSearchQuery)}`);
        if (!response.ok) throw new Error('Failed to fetch venues');
        
        const data = await response.json();
        console.log("Fetched venues:", data);
        setVenues(data);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVenues();
  }, [debouncedSearchQuery]);
  
  return (
    <div className="w-full my-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {activeVenueId ? activeVenueName : "Search venues..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder="Search venues..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-9" 
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              )}
              {!isLoading && venues.length === 0 && (
                <CommandEmpty>No venues found.</CommandEmpty>
              )}
              {!isLoading && venues.length > 0 && (
                <CommandGroup>
                  {venues.map((venue) => (
                    <CommandItem
                      key={venue._id}
                      value={venue.name} // Keep value as the name for searching
                      onSelect={() => {
                        setActiveVenue(venue._id, venue.name);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          activeVenueId === venue._id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {venue.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}