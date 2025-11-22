export interface MapPoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface MapBounds {
  latLngBounds: naver.maps.LatLngBounds;
  padding: number;
}

export interface MapCenterState extends MapPoint {
  zoom?: number;
}