'use client';

import { useState, useCallback } from 'react';
import { plannerService } from '@/services/planner.service';
import { PlannerRequest, PlannerResponse, MapPin } from '@/types/planner';

interface UsePlannerReturn {
  isLoading: boolean;
  error: string | null;
  itinerary: PlannerResponse | null;
  pins: MapPin[];
  createItinerary: (request: PlannerRequest) => Promise<void>;
  clearItinerary: () => void;
}


export function usePlanner(): UsePlannerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<PlannerResponse | null>(null);


  const pins: MapPin[] = itinerary
    ? [
        {
          lat: itinerary.userInput.destination.lat,
          lng: itinerary.userInput.destination.lng,
          name: 'Destination',
          type: 'destination',
        },

        ...itinerary.places.map((place) => ({
          lat: place.lat,
          lng: place.lng,
          name: place.name,
          type: 'attraction' as const,
        })),

        ...itinerary.restaurants.map((restaurant) => ({
          lat: restaurant.lat,
          lng: restaurant.lng,
          name: restaurant.name,
          type: 'restaurant' as const,
        })),
      ]
    : [];

  const createItinerary = useCallback(async (request: PlannerRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await plannerService.createItinerary(request);
      setItinerary(response);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create itinerary';
      setError(errorMessage);
      console.error('Planner error:', err);
      throw err; 
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearItinerary = useCallback(() => {
    setItinerary(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    itinerary,
    pins,
    createItinerary,
    clearItinerary,
  };
}

