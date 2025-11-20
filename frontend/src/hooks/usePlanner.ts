import { useState, useCallback } from 'react';
import { plannerService, UserInput, Place, Restaurant } from '@/services/plannerService';

interface UsePlannerReturn {
  places: Place[];
  restaurants: Restaurant[];
  itinerary: string;
  loading: boolean;
  error: string | null;
  createItinerary: (userInput: UserInput) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for creating travel itineraries
 * 
 * @returns Planner state and actions
 * 
 * @example
 * const { places, restaurants, itinerary, loading, error, createItinerary } = usePlanner();
 * 
 * await createItinerary({
 *   destination: { lat: 37.5665, lng: 126.9780 },
 *   startDate: "2025-11-19",
 *   numberOfDays: 3,
 *   people: "2 people",
 *   budget: "Standard",
 *   theme: "Cultural & Historical"
 * });
 */
export const usePlanner = (): UsePlannerReturn => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [itinerary, setItinerary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItinerary = useCallback(async (userInput: UserInput) => {
    console.log('🎯 Creating itinerary for:', userInput);
    setLoading(true);
    setError(null);

    try {
      const response = await plannerService.createItinerary(userInput);
      
      if (response && response.data) {
        console.log('✅ Itinerary created successfully');
        setPlaces(response.data.places || []);
        setRestaurants(response.data.restaurants || []);
        setItinerary(response.data.itinerary || '');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create itinerary';
      setError(errorMsg);
      console.error('❌ Itinerary creation error:', errorMsg, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    places,
    restaurants,
    itinerary,
    loading,
    error,
    createItinerary,
    clearError,
  };
};


