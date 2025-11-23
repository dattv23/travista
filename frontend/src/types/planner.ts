// Planner API Types

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AIItineraryResult {
  days: DayPlan[];
}

export interface PlannerRequest {
  destination: { lat: number; lng: number };
  startDate: string;
  numberOfDays: number;
  people: string;
  budget: string;
  theme: string;
}

// 2. The specific structure of the AI JSON string
export interface TimelineItem {
  index: number;
  nameEN: string;
  nameKR?: string;
  type: 'attraction' | 'restaurant' | 'car';
  start_time: string;
  end_time: string;
  duration_minutes: number;
  lat: number | null;
  lng: number | null;
  note: string;
  uniqueId?: string;
}

export interface DayPlan {
  day_index: number;
  date: string; // YYYY-MM-DD
  timeline: TimelineItem[];
}

export interface AIItineraryResult {
  days: DayPlan[];
}

export interface RouteSection {
  pointIndex: number;
  distanceText: string;
  durationMinutes: number;
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  path?: number[][];
}

export interface RouteData {
  summary: {
    distance: string;
    duration: string;
    taxiFare: number;
  };
  sections: RouteSection[];
  path: number[][];
}

export interface Place {
  name: string;
  address: string;
  lat: number;
  lng: number;
  kakaoId?: string;
  distance?: number;
  duration?: number;
}

export interface Restaurant extends Place {
  phone?: string;
  url?: string;
}

export interface RouteInfo {
  distance: number;
  duration: number;
}

export interface PlannerResponse {
  userInput: PlannerRequest;
  places: Place[];
  restaurants: Restaurant[];
  userDestinationMatrix: (Place & RouteInfo)[];
  destinationMatrix: {
    from: string;
    routes: (RouteInfo & { to: string })[];
  }[];
  restaurantDestinationMatrix: {
    from: string;
    routes: (RouteInfo & { to: string })[];
  }[];
  itinerary: string;
  routeData?: RouteData;
}

export interface MapPin {
  lat: number;
  lng: number;
  name?: string;
  type?: 'attraction' | 'restaurant' | 'destination';
}
