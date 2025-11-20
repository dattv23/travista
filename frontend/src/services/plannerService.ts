// ==================== TYPES ====================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserInput {
  destination: Coordinates;
  startDate: string; // ISO date string
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

export interface DistanceInfo extends Place {
  distance: number;
  duration: number;
}

export interface Route {
  to: string;
  distance: number;
  duration: number;
}

export interface DestinationRoute {
  from: string;
  routes: Route[];
}

export interface RestaurantRoute {
  from: string;
  routes: Route[];
}

export interface ItineraryResponse {
  userInput: UserInput;
  places: Place[];
  restaurants: Restaurant[];
  userDestinationMatrix: DistanceInfo[];
  destinationMatrix: DestinationRoute[];
  restaurantDestinationMatrix: RestaurantRoute[];
  itinerary: string; // JSON string from AI
}

export interface ParsedItinerary {
  days: DayItinerary[];
}

export interface DayItinerary {
  day_index: number;
  date: string;
  timeline: TimelineItem[];
}

export interface TimelineItem {
  index: number;
  name: string;
  type: 'attraction' | 'restaurant';
  start_time: string;
  end_time: string;
  duration_minutes: number;
  lat: number | null;
  lng: number | null;
  note: string;
}

// ==================== SERVICE ====================

export const plannerService = {
  /**
   * Create a new travel itinerary
   * POST /api/planner/create-itinerary
   * 
   * @param userInput - User preferences and trip details
   * @returns Complete itinerary with places, routes, and AI-generated schedule
   */
  async createItinerary(userInput: UserInput): Promise<ItineraryResponse> {
    try {
      console.log('🚀 Creating itinerary with:', userInput);

      const response = await fetch('http://localhost:8080/api/planner/create-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInput)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Itinerary created successfully:', data);

      return data;
    } catch (error: any) {
      console.error('❌ Planner service error:', error);
      throw new Error(error.message || 'Failed to create itinerary');
    }
  },

  /**
   * Parse the AI-generated itinerary JSON string
   * 
   * @param itineraryString - JSON string from the AI
   * @returns Parsed itinerary object
   */
  parseItinerary(itineraryString: string): ParsedItinerary | null {
    try {
      return JSON.parse(itineraryString) as ParsedItinerary;
    } catch (error) {
      console.error('❌ Failed to parse itinerary:', error);
      return null;
    }
  },

  /**
   * Extract all locations (with coordinates) from the itinerary for mapping
   * 
   * @param response - Complete itinerary response
   * @returns Array of coordinates for mapping
   */
  extractLocations(response: ItineraryResponse): Coordinates[] {
    const parsedItinerary = this.parseItinerary(response.itinerary);
    
    if (!parsedItinerary) {
      // Fallback to places if parsing fails
      return response.places.map(p => ({ lat: p.lat, lng: p.lng }));
    }

    // Extract unique locations from all days
    const locationMap = new Map<string, Coordinates>();

    parsedItinerary.days.forEach(day => {
      day.timeline.forEach(item => {
        if (item.lat && item.lng) {
          const key = `${item.lat},${item.lng}`;
          if (!locationMap.has(key)) {
            locationMap.set(key, { lat: item.lat, lng: item.lng });
          }
        }
      });
    });

    return Array.from(locationMap.values());
  }
};

