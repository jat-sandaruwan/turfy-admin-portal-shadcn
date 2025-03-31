"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useVenueStore } from "@/lib/store/venue-store";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  
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
        setVenues(data);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVenues();
  }, [debouncedSearchQuery]);

  const handleCreateVenue = () => {
    setOpen(false);
    router.push('/dashboard/venues/create');
  };
  
  return (
    <div className="w-full px-3 mb-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {activeVenueId ? (
              <span className="truncate">{activeVenueName}</span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1">
                <Search className="h-3.5 w-3.5" />
                <span>Search venues...</span>
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
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
              {!isLoading && venues.length === 0 && debouncedSearchQuery && (
                <CommandEmpty>No venues found.</CommandEmpty>
              )}
              {!isLoading && venues.length > 0 && (
                <CommandGroup heading="Venues">
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
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateVenue}
                  className="text-primary cursor-pointer"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Venue
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}