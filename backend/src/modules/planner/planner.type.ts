export interface IKakaoMapsResponse {
  place_name: string
  road_address_name: string
  address_name: string
  y: number
  x: number
  distance: number
  phone: string
  id: string
  place_url: string
}

export interface ICoordinates {
  lat: number
  lng: number
}

export interface IPlace {
  name: string
  address: string
  lat: number
  lng: number
  kakaoId: string
}

export interface IRestaurant extends IPlace {
  distance: number
  phone: string
  url: string
}

export interface IDistanceInfo extends IPlace {
  distance: number
  duration: number
}

export interface IRoute {
  to: string
  distance: number
  duration: number
}

export interface IRouteResult {
  distance: number
  duration: number
}

export interface IDestinationRoute {
  from: string
  routes: IRoute[]
}

export interface IRestaurantRoute {
  from: string
  routes: IRoute[]
}

export interface IItineraryState {
  lat: number
  lng: number
  places: IPlace[]
  restaurants: IRestaurant[]
  userDestinationMatrix: IDistanceInfo[]
  destinationMatrix: IDestinationRoute[]
  restaurantDestinationMatrix: IRestaurantRoute[]
  itinerary: string
}
