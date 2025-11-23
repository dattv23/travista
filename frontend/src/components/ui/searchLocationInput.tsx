'use client';

import axios from "axios";
import { useEffect, useRef, useState } from "react";

interface SearchLocationProps {
  onSelect: (location: { name: string, lat: number, lng: number }) => void;
  error?: boolean;
}

export default function SearchLocationInput({ onSelect, error }: SearchLocationProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // --- Debouncing ---
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Set a timer to run the API call
    const delayDebounceFn = setTimeout(async () => {
      try {
        setIsLoading(true);
        console.log('Fetching from API:', query); 
        
        const res = await axios.get(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/search/location`, {
          params: { keyword: query }
        });
        
        setResults(res.data.addresses || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Error fetching location', error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
    
  }, [query]); // Only re-run if 'query' changes

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input 
        type="text" 
        className={`text-dark-text paragraph-p2-medium w-full rounded-lg border-2 p-3 pl-10 placeholder-[color-mix(in_srgb,var(--color-hover),black_20%)] transition outline-none 
        focus:ring-1 focus:ring-primary focus:border-primary
        ${error 
            ? "border-red-500" 
            : "border-sub-text"
        }`}
        placeholder="Enter a location"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {isLoading && (
        <div className="absolute right-3 top-3.5">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md bg-card shadow-lg py-1">
          {results.map((item, index) => (
            <li
              key={index}
              className="text-dark-text hover:bg-hover block w-full cursor-pointer px-4 py-2 text-left transition"
              onClick={() => {
                const locationData = {
                  name: item.roadAddress || item.jibunAddress,
                  lat: parseFloat(item.y),
                  lng: parseFloat(item.x),
                };
                setQuery(locationData.name);
                setResults([]);
                setIsOpen(false);
                onSelect(locationData);
              }}
            >
              <div className="paragraph-p2-medium text-dark-text">
                {item.roadAddress || item.jibunAddress}
              </div>
              <div className="text-xs text-sub-text">
                 {item.jibunAddress !== item.roadAddress ? item.jibunAddress : ''}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
