// Planner API Types

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlannerRequest {
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
}

export interface MapPin {
  lat: number;
  lng: number;
  name?: string;
  type?: 'attraction' | 'restaurant' | 'destination';
}

