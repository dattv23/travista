import axiosClient from '@/config/axiosClient';

// ==================== TYPES ====================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserInput {
  destination: Coordinates;
  startDate: string;
  numberOfDays: number;
  people: string;
  budget: string;
  theme: string;
}

export interface Place {
  name: string;
  address: string;
  lat: number;
  lng: number;
  kakaoId: string;
}

export interface Restaurant extends Place {
  distance: number;
  phone: string;
  url: string;
}

export interface ItineraryResponse {
  success: boolean;
  data: {
    userInput: UserInput;
    places: Place[];
    restaurants: Restaurant[];
    itinerary: string;
  };
}

// ==================== SERVICE ====================

export const plannerService = {
  /**
   * Create itinerary by calling the backend planner API
   * POST /api/planner/create-itinerary
   * 
   * @param userInput - User's travel preferences
   * @returns Generated itinerary with places and restaurants
   */
  async createItinerary(userInput: UserInput): Promise<ItineraryResponse> {
    try {
      console.log('🎯 Creating itinerary with:', userInput);

      const response = await axiosClient.post<ItineraryResponse>(
        '/planner/create-itinerary',
        userInput
      );

      console.log('✅ Itinerary created:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Planner service error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create itinerary'
      );
    }
  },

  /**
   * Geocode a location string to coordinates using Kakao Maps
   * (Helper function for when user enters a location name)
   * 
   * @param locationName - Location name to geocode
   * @returns Coordinates { lat, lng }
   */
  async geocodeLocation(locationName: string): Promise<Coordinates> {
    try {
      console.log('🗺️ Geocoding location:', locationName);

      // This would typically call a backend endpoint that uses Kakao Maps API
      // For now, we'll use a direct fetch approach
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(locationName)}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_API_KEY}`,
          },
        }
      );

      const data = await response.json();

      if (data.documents && data.documents.length > 0) {
        const firstResult = data.documents[0];
        return {
          lat: Number(firstResult.y),
          lng: Number(firstResult.x),
        };
      }

      throw new Error('Location not found');
    } catch (error: any) {
      console.error('❌ Geocoding error:', error);
      throw new Error(error.message || 'Failed to geocode location');
    }
  },
};


