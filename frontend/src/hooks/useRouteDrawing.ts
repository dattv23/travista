import { useState, useCallback } from 'react';
import { mapperService, type RouteLocation, type RouteData } from '@/services/mapperService';

interface UseRouteDrawingReturn {
  route: RouteData | null;
  loading: boolean;
  error: string | null;
  drawRoute: (locations: RouteLocation[]) => Promise<void>;
  clearRoute: () => void;
}

/**
 * Custom hook for managing route drawing with the mapper API
 * 
 * @example
 * const { route, loading, error, drawRoute } = useRouteDrawing();
 * 
 * useEffect(() => {
 *   if (places.length >= 2) {
 *     drawRoute(places);
 *   }
 * }, [places]);
 */
export const useRouteDrawing = (): UseRouteDrawingReturn => {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const drawRoute = useCallback(async (locations: RouteLocation[]) => {
    if (locations.length < 2) {
      setError('Need at least 2 locations to draw a route');
      return;
    }

    if (locations.length > 7) {
      setError('Maximum 7 locations allowed (start + 5 waypoints + goal)');
      return;
    }

    console.log('🎯 Drawing route for', locations.length, 'locations');
    setLoading(true);
    setError(null);

    try {
      const response = await mapperService.getDirections(locations);
      
      if (response.success) {
        console.log('✅ Route loaded successfully:', response.data.summary);
        setRoute(response.data);
      } else {
        throw new Error('Route request failed');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to draw route';
      setError(errorMsg);
      console.error('❌ Route drawing error:', errorMsg, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  return { route, loading, error, drawRoute, clearRoute };
};

