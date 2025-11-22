import axiosClient from '@/config/axiosClient';

export interface ValidateItineraryRequest {
  stopList: string[];
  newStop: string;
  insertAfterIndex?: number;
  maxDurationHours?: number;
  existingSegmentDurations?: number[];
  existingSegmentDistances?: number[];
}

export interface ValidateItineraryResponse {
  success: boolean;
  valid: boolean;
  totalDurationMinutes: number;
  totalDistanceMeters: number;
  totalDistanceKm: number;
  maxDurationMinutes: number;
  exceededByMinutes?: number;
  newSegmentDuration?: number;
  newSegmentDistanceMeters?: number;
  segmentDurations: number[];
  segmentDistances: number[];
  segmentDetails: Array<{ duration: number; distance: number }>;
  message: string;
}

export interface DrawRouteRequest {
  locations: string[];
}

export interface DrawRouteResponse {
  success: boolean;
  data: {
    summary: {
      distance: string;
      duration: string;
      tollFare: number;
      taxiFare: number;
      fuelPrice: number;
    };
    sections: Array<{
      pointIndex: number;
      start: { lng: number; lat: number };
      end: { lng: number; lat: number };
      distanceText: string;
      durationMinutes: number;
    }>;
    path: number[][];
    guide: any[];
  };
}

export const mapperService = {
  async validateItineraryDuration(
    request: ValidateItineraryRequest
  ): Promise<ValidateItineraryResponse> {
    try {
      const response = await axiosClient.post<ValidateItineraryResponse>(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mapper/validate-itinerary-duration`,
        request,
        {
          timeout: 30000,
        }
      );
      return response as unknown as ValidateItineraryResponse;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to validate itinerary';
      console.error('Mapper API error:', error);
      throw new Error(errorMessage);
    }
  },

  async drawRoute(request: DrawRouteRequest): Promise<DrawRouteResponse> {
    try {
      const response = await axiosClient.post<DrawRouteResponse>(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mapper/draw-route`,
        request,
        {
          timeout: 30000,
        }
      );
      return response as unknown as DrawRouteResponse;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to draw route';
      console.error('Draw route API error:', error);
      throw new Error(errorMessage);
    }
  },
};

