// Shared types for Naver Map components

export interface MapPoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface NaverMapProps {
  path?: MapPoint[];
  routePath?: [number, number][]; // Route polyline from mapper API
  mapZoom?: number;
  center?: MapPoint;
  onPinClick?: (point: MapPoint) => void;
}

