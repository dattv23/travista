/**
 * API Integration Examples
 * 
 * This file contains example implementations for different API providers.
 * Copy the relevant code to location.service.ts when you choose an API provider.
 */

import axios from 'axios'

// ============================================================================
// GOOGLE MAPS API EXAMPLE
// ============================================================================

export class GoogleMapsService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || ''
  }

  async geocode(address: string) {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: this.apiKey,
        language: 'vi', // Vietnamese language
      },
      timeout: 10000,
    })

    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${response.data.status}`)
    }

    const result = response.data.results[0]
    return {
      address: address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      formattedAddress: result.formatted_address,
    }
  }

  async getDirections(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: this.apiKey,
        mode: 'driving',
        language: 'vi',
        alternatives: true, // Get alternative routes
      },
      timeout: 15000,
    })

    if (response.data.status !== 'OK') {
      throw new Error(`Directions failed: ${response.data.status}`)
    }

    const route = response.data.routes[0]
    const leg = route.legs[0]

    return {
      origin,
      destination,
      distance: leg.distance.text,
      duration: leg.duration.text,
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions,
        distance: step.distance.text,
        duration: step.duration.text,
        startLocation: step.start_location,
        endLocation: step.end_location,
      })),
      polyline: route.overview_polyline.points,
      rawData: response.data,
    }
  }
}

// ============================================================================
// GOONG.IO API EXAMPLE (Vietnamese Service)
// ============================================================================

export class GoongService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GOONG_API_KEY || ''
  }

  async geocode(address: string) {
    // Goong Place API for geocoding
    const response = await axios.get('https://rsapi.goong.io/Place/AutoComplete', {
      params: {
        api_key: this.apiKey,
        input: address,
        location: '10.8231,106.6297', // Default to HCM center for better results
      },
      timeout: 10000,
    })

    if (!response.data.predictions || response.data.predictions.length === 0) {
      throw new Error('No results found for address')
    }

    const prediction = response.data.predictions[0]
    
    // Get detailed place info to get coordinates
    const detailResponse = await axios.get('https://rsapi.goong.io/Place/Detail', {
      params: {
        api_key: this.apiKey,
        place_id: prediction.place_id,
      },
    })

    const place = detailResponse.data.result
    return {
      address: address,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      formattedAddress: place.formatted_address,
    }
  }

  async getDirections(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    const response = await axios.get('https://rsapi.goong.io/Direction', {
      params: {
        api_key: this.apiKey,
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        vehicle: 'car', // car, bike, taxi, hd (high-quality)
      },
      timeout: 15000,
    })

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('No route found')
    }

    const route = response.data.routes[0]
    const leg = route.legs[0]

    return {
      origin,
      destination,
      distance: `${(leg.distance.value / 1000).toFixed(1)} km`,
      duration: `${Math.round(leg.duration.value / 60)} phút`,
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions,
        distance: `${(step.distance.value / 1000).toFixed(2)} km`,
        duration: `${Math.round(step.duration.value / 60)} phút`,
        maneuver: step.maneuver,
      })),
      polyline: route.overview_polyline.points,
      rawData: response.data,
    }
  }
}

// ============================================================================
// MAPBOX API EXAMPLE
// ============================================================================

export class MapboxService {
  private accessToken: string

  constructor() {
    this.accessToken = process.env.MAPBOX_ACCESS_TOKEN || ''
  }

  async geocode(address: string) {
    // URL encode the address
    const encodedAddress = encodeURIComponent(address)
    
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json`,
      {
        params: {
          access_token: this.accessToken,
          country: 'VN', // Limit to Vietnam
          language: 'vi', // Vietnamese language
          limit: 1,
        },
        timeout: 10000,
      }
    )

    if (!response.data.features || response.data.features.length === 0) {
      throw new Error('No results found for address')
    }

    const feature = response.data.features[0]
    return {
      address: address,
      coordinates: {
        lng: feature.geometry.coordinates[0], // Mapbox uses [lng, lat]
        lat: feature.geometry.coordinates[1],
      },
      formattedAddress: feature.place_name,
    }
  }

  async getDirections(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    // Mapbox uses lng,lat format
    const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
    
    const response = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`,
      {
        params: {
          access_token: this.accessToken,
          language: 'vi',
          steps: true,
          overview: 'full',
          geometries: 'polyline',
          alternatives: true,
        },
        timeout: 15000,
      }
    )

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('No route found')
    }

    const route = response.data.routes[0]
    const leg = route.legs[0]

    return {
      origin,
      destination,
      distance: `${(route.distance / 1000).toFixed(1)} km`,
      duration: `${Math.round(route.duration / 60)} phút`,
      steps: leg.steps.map((step: any) => ({
        instruction: step.maneuver.instruction,
        distance: `${(step.distance / 1000).toFixed(2)} km`,
        duration: `${Math.round(step.duration / 60)} phút`,
        maneuver: step.maneuver.type,
      })),
      polyline: route.geometry,
      rawData: response.data,
    }
  }
}

// ============================================================================
// OPENSTREETMAP / NOMINATIM EXAMPLE (Free, but rate-limited)
// ============================================================================

export class NominatimService {
  private baseUrl: string

  constructor() {
    // Use official Nominatim or self-hosted instance
    this.baseUrl = 'https://nominatim.openstreetmap.org'
  }

  async geocode(address: string) {
    const response = await axios.get(`${this.baseUrl}/search`, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        countrycodes: 'vn', // Limit to Vietnam
        'accept-language': 'vi',
      },
      headers: {
        'User-Agent': 'Travista App', // Required by Nominatim
      },
      timeout: 10000,
    })

    if (!response.data || response.data.length === 0) {
      throw new Error('No results found for address')
    }

    const result = response.data[0]
    return {
      address: address,
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
      formattedAddress: result.display_name,
    }
  }

  // Note: Nominatim doesn't provide directions API
  // You would need to use OSRM (Open Source Routing Machine) for directions
  async getDirections(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    // Using OSRM demo server (not for production!)
    const response = await axios.get(
      `http://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
      {
        params: {
          overview: 'full',
          geometries: 'geojson',
          steps: true,
        },
        timeout: 15000,
      }
    )

    if (response.data.code !== 'Ok' || !response.data.routes) {
      throw new Error('No route found')
    }

    const route = response.data.routes[0]
    const leg = route.legs[0]

    return {
      origin,
      destination,
      distance: `${(route.distance / 1000).toFixed(1)} km`,
      duration: `${Math.round(route.duration / 60)} phút`,
      steps: leg.steps.map((step: any) => ({
        instruction: step.maneuver.instruction || step.name,
        distance: `${(step.distance / 1000).toFixed(2)} km`,
        duration: `${Math.round(step.duration / 60)} phút`,
      })),
      polyline: route.geometry.coordinates,
      rawData: response.data,
    }
  }
}

// ============================================================================
// HOW TO USE
// ============================================================================

/**
 * To integrate one of these services:
 * 
 * 1. Choose the service you want to use (Google Maps, Goong, Mapbox, etc.)
 * 
 * 2. Copy the relevant methods to location.service.ts
 * 
 * 3. Update your .env file with the appropriate API key/token:
 *    - Google Maps: GOOGLE_MAPS_API_KEY=your_key
 *    - Goong: GOONG_API_KEY=your_key
 *    - Mapbox: MAPBOX_ACCESS_TOKEN=your_token
 * 
 * 4. Update the constructor in location.service.ts to use the correct API
 * 
 * 5. Test the endpoints with real data
 * 
 * Example for Google Maps:
 * 
 * // In location.service.ts
 * constructor() {
 *   this.apiKey = process.env.GOOGLE_MAPS_API_KEY || ''
 * }
 * 
 * async geocode(address: string): Promise<GeocodeResult> {
 *   // Copy the geocode method from GoogleMapsService above
 * }
 */

