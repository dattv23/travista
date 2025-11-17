// Geocoding Types
export interface IGeocodeRequest {
  query: string
  coordinate?: string
  filter?: string
  language?: 'kor' | 'eng'
  page?: number
  count?: number
}

export interface IAddressElement {
  types: string[]
  longName: string
  shortName: string
  code: string
}

export interface IAddress {
  roadAddress: string
  jibunAddress: string
  englishAddress: string
  addressElements: IAddressElement[]
  x: string
  y: string
  distance: number
}

export interface IGeocodeResponse {
  status: string
  meta: {
    totalCount: number
    page: number
    count: number
  }
  addresses: IAddress[]
  errorMessage?: string
}

// Directions Types
export interface IDirectionsRequest {
  start: string // longitude,latitude
  goal: string // longitude,latitude
  waypoints?: string
  option?: 'trafast' | 'tracomfort' | 'traoptimal' | 'traavoidtoll' | 'traavoidcaronly'
  cartype?: number
  fueltype?: number
  mileage?: number
}

export interface ILocation {
  location: [number, number]
  dir?: number
}

export interface ISummary {
  start: ILocation
  goal: ILocation
  distance: number
  duration: number
  departureTime: string
  bbox: [[number, number], [number, number]]
  tollFare: number
  taxiFare: number
  fuelPrice: number
}

export interface ISection {
  pointIndex: number
  pointCount: number
  distance: number
  name: string
  congestion: number
  speed: number
}

export interface IGuide {
  pointIndex: number
  type: number
  instructions: string
  distance: number
  duration: number
}

export interface IRouteDetail {
  summary: ISummary
  path: [number, number][]
  section: ISection[]
  guide: IGuide[]
}

export interface IDirectionsResponse {
  code: number
  message: string
  currentDateTime: string
  route: {
    trafast?: IRouteDetail[]
    tracomfort?: IRouteDetail[]
    traoptimal?: IRouteDetail[]
    traavoidtoll?: IRouteDetail[]
    traavoidcaronly?: IRouteDetail[]
  }
}

