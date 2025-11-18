import axiosClient from '@/config/axiosClient';

// ==================== TYPES ====================

export interface RouteLocation {
  lat: number;
  lng: number;
  name?: string;
}

export interface RouteSummary {
  distance: string;
  duration: string;
  tollFare: number;
  taxiFare: number;
  fuelPrice: number;
}

export interface RouteGuide {
  pointIndex: number;
  type: number;
  instructions: string;
  distance: number;
  duration: number;
}

export interface RouteData {
  summary: RouteSummary;
  path: [number, number][]; // [[lng, lat], ...]
  guide: RouteGuide[];
  fullData?: any;
}

export interface RouteResponse {
  success: boolean;
  data: RouteData;
}

// ==================== SERVICE ====================

export const mapperService = {
  /**
   * Get directions for multiple locations
   * Automatically sends to POST /api/mapper/draw-route
   * 
   * @param locations - Array of locations with lat/lng
   * @returns Route data with path for drawing
   */
  async getDirections(locations: RouteLocation[]): Promise<RouteResponse> {
    try {
      // Convert to "lng,lat" format required by backend
      const formattedLocations = locations.map(loc => `${loc.lng},${loc.lat}`);

      const response = await axiosClient.post<RouteResponse>(
        '/mapper/draw-route',
        { locations: formattedLocations }
      );

      return response;
    } catch (error: any) {
      console.error('Mapper service error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get directions');
    }
  },

  /**
   * Get simple directions between two points with optional waypoints
   * 
   * @param start - Starting location "lng,lat"
   * @param goal - Destination "lng,lat"
   * @param waypoints - Optional waypoints "lng,lat|lng,lat"
   * @param option - Route option (trafast, traoptimal, etc.)
   */
  async getSimpleDirections(
    start: string,
    goal: string,
    waypoints?: string,
    option: string = 'trafast'
  ): Promise<RouteResponse> {
    try {
      const response = await axiosClient.post<RouteResponse>(
        '/mapper/get-directions',
        { start, goal, waypoints, option }
      );

      return response;
    } catch (error: any) {
      console.error('Mapper service error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get directions');
    }
  }
};

