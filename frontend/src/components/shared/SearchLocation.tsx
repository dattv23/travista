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
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
    onSelect(selected);
  };

  const handleInputChange = (query: string) => {
    setQuery(query);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => query && setIsOpen(true)}
        className="border-sub-text text-dark-text paragraph-p2-medium focus:border-primary focus:ring-primary w-full rounded-lg border-2 p-3 pl-10 placeholder-[color-mix(in_srgb,var(--color-hover),black_20%)] transition focus:ring-1 focus:outline-none"
      />

      {isOpen && (
        <div className="bg-background absolute top-full right-0 left-0 z-10 mt-2 max-h-64 overflow-y-auto rounded-xl border shadow-lg">
          {loading && <div className="px-4 py-3 text-center text-sm text-gray-500">Loading...</div>}

          {error && <div className="text-destructive px-4 py-3 text-sm">{error}</div>}

          {!loading && results.length === 0 && !error && (
            <div className="px-4 py-3 text-center text-sm text-gray-500">No results found</div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-2">
              {results.map((place, id) => (
                <div
                  key={id}
                  onClick={() => handleLocationSelect(place)}
                  className="cursor-pointer rounded px-3 py-2 transition-colors hover:bg-gray-100"
                >
                  <div className="text-sm font-medium">{place.roadAddress}</div>
                  <div className="text-xs text-gray-500">{place.englishAddress}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
