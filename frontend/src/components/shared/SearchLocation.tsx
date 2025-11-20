'use client';

import { useState, useEffect, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup } from '@/components/ui/command';
import { locationService } from '@/services/locationService';
import { LocationItem } from './LocationItem';
import { LocationLoadingSkeleton, NoResultsMessage } from './LocationSearchStates';
import { Location, SearchResult } from '@/types/location';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchLocationProps {
  onSelect: (data: Location) => void;
  placeholder?: string;
}

export default function SearchLocation({
  onSelect,
  placeholder = 'Search location...',
}: SearchLocationProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await locationService.searchPlaces(keyword);
      setResults(response.addresses || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useDebounce(handleSearch, 1000);

  useEffect(() => {
    if (query.length > 1) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch]);

  const handleLocationSelect = (place: SearchResult) => {
    const selected: Location = {
      name: place.englishAddress || place.roadAddress,
      lat: Number(place.y),
      lng: Number(place.x),
    };

    setQuery(place.roadAddress);
    setOpen(false);
    onSelect(selected);
  };

  const renderContent = () => {
    if (loading) return <LocationLoadingSkeleton />;

    if (error) {
      return <div className="text-destructive p-3 text-sm">{error}</div>;
    }

    if (results.length === 0) {
      return <NoResultsMessage />;
    }

    return results.map((place) => (
      <LocationItem
        key={`${place.x}-${place.y}`}
        place={place}
        onSelect={() => handleLocationSelect(place)}
      />
    ));
  };

  const handleInputChange = (query: string) => {
    setQuery(query);
    setOpen(true);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild contentEditable={false}>
        <div className="relative w-full">
          <input
            type="text"
            placeholder={placeholder}
            value={query ?? ''}
            onChange={(e) => handleInputChange(e.target.value)}
            className="border-sub-text text-dark-text paragraph-p2-medium focus:border-primary focus:ring-primary w-full rounded-lg border-2 p-3 pl-10 placeholder-[color-mix(in_srgb,var(--color-hover),black_20%)] transition focus:ring-1 focus:outline-none"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="bg-background w-full rounded-xl border p-0 shadow-lg"
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest('input')) {
            setOpen(false);
          }
        }}
      >
        <Command className="max-h-64 overflow-y-auto">
          <CommandGroup heading="Results" className="px-2 py-2">
            {renderContent()}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
