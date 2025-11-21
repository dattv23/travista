export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface SearchResult {
  roadAddress: string;
  englishAddress: string;
  jibunAddress: string;
  x: string;
  y: string;
}

export interface SearchResponse {
  addresses: SearchResult[];
}
