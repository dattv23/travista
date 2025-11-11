# Geocoding & Directions API Spike Guide

## Overview
This spike implements two main features:
1. **Geocoding**: Convert addresses to coordinates (lat/lng)
2. **Directions**: Get route data between two points

## Project Structure

```
backend/src/modules/location/
├── location.service.ts      # Business logic & API calls
├── location.controller.ts   # HTTP request handlers
├── location.route.ts        # Route definitions
└── location.validation.ts   # Zod validation schemas
```

## API Endpoints

### 1. Geocode Address
**Endpoint**: `POST /api/location/geocode`

**Request Body**:
```json
{
  "address": "123 Main St, Ho Chi Minh City, Vietnam"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "address": "123 Main St, Ho Chi Minh City, Vietnam",
    "coordinates": {
      "lat": 10.8231,
      "lng": 106.6297
    },
    "formattedAddress": "123 Main St, District 1, Ho Chi Minh City, Vietnam"
  },
  "message": "Address geocoded successfully"
}
```

### 2. Get Directions (by Coordinates)
**Endpoint**: `POST /api/location/directions`

**Request Body**:
```json
{
  "origin": {
    "lat": 10.8231,
    "lng": 106.6297
  },
  "destination": {
    "lat": 10.7769,
    "lng": 106.7009
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "origin": { "lat": 10.8231, "lng": 106.6297 },
    "destination": { "lat": 10.7769, "lng": 106.7009 },
    "distance": "15.2 km",
    "duration": "25 mins",
    "steps": [...],
    "polyline": "encoded_polyline_string",
    "rawData": { /* full API response */ }
  },
  "message": "Directions retrieved successfully"
}
```

### 3. Get Directions (by Address)
**Endpoint**: `POST /api/location/directions-by-address`

**Request Body**:
```json
{
  "originAddress": "Ben Thanh Market, Ho Chi Minh City",
  "destinationAddress": "Tan Son Nhat Airport, Ho Chi Minh City"
}
```

**Response**: Same as endpoint #2

## Setup Instructions

### 1. Install Dependencies
The required dependency `axios` needs to be added:

```bash
cd backend
npm install axios
npm install --save-dev @types/axios
```

### 2. Environment Variables
Copy `.env.example` to `.env` and configure:

```env
GEOCODING_API_URL=https://your-api.com/geocode
DIRECTIONS_API_URL=https://your-api.com/directions
LOCATION_API_KEY=your_actual_api_key
```

### 3. Start the Server
```bash
npm run dev
```

## Integration Steps (When You Have the API)

### For Google Maps API:
1. Get API key from Google Cloud Console
2. Enable "Geocoding API" and "Directions API"
3. Update `location.service.ts`:

```typescript
// Geocoding
this.geocodingApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json'

// Directions
this.directionsApiUrl = 'https://maps.googleapis.com/maps/api/directions/json'
```

### For Mapbox API:
1. Get API token from Mapbox
2. Update `location.service.ts`:

```typescript
// Geocoding
this.geocodingApiUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places'

// Directions
this.directionsApiUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving'
```

### For Vietnamese Services (Goong, etc.):
1. Get API key from the service provider
2. Update URLs accordingly
3. Adjust response parsing based on their API structure

## Testing with Postman/Thunder Client

### Test Geocoding:
```bash
POST http://localhost:5000/api/location/geocode
Content-Type: application/json

{
  "address": "Nhà thờ Đức Bà, Quận 1, TP. HCM"
}
```

### Test Directions:
```bash
POST http://localhost:5000/api/location/directions
Content-Type: application/json

{
  "origin": { "lat": 10.8231, "lng": 106.6297 },
  "destination": { "lat": 10.7769, "lng": 106.7009 }
}
```

### Test Directions by Address:
```bash
POST http://localhost:5000/api/location/directions-by-address
Content-Type: application/json

{
  "originAddress": "Chợ Bến Thành, TP. HCM",
  "destinationAddress": "Sân bay Tân Sơn Nhất, TP. HCM"
}
```

## What to Modify When You Get the Actual API

### In `location.service.ts`:

1. **Update API URLs** (constructor):
```typescript
this.geocodingApiUrl = 'YOUR_ACTUAL_GEOCODING_URL'
this.directionsApiUrl = 'YOUR_ACTUAL_DIRECTIONS_URL'
```

2. **Update Request Parameters** (in `geocode` method):
```typescript
const response = await axios.get(this.geocodingApiUrl, {
  params: {
    // Replace with actual params from API docs
    address: address,
    key: this.apiKey,
    // Add other params...
  },
})
```

3. **Update Response Parsing**:
```typescript
// Parse based on actual API response structure
const result: GeocodeResult = {
  address: address,
  coordinates: {
    lat: response.data.YOUR_ACTUAL_LAT_PATH,
    lng: response.data.YOUR_ACTUAL_LNG_PATH,
  },
  formattedAddress: response.data.YOUR_ACTUAL_ADDRESS_PATH,
}
```

4. **Same for Directions** (in `getDirections` method)

## Common API Providers for Vietnam

1. **Google Maps API**: Most reliable, costs money after free tier
2. **Goong.io**: Vietnamese service, good local data
3. **Mapbox**: Modern, developer-friendly
4. **OpenStreetMap (Nominatim)**: Free but rate-limited

## Error Handling
The service includes:
- Request timeouts (10s for geocoding, 15s for directions)
- Winston logging for debugging
- Error propagation to Express error handler
- Validation with Zod schemas

## Next Steps for Spike
1. ✅ Structure is ready
2. ⏳ Get actual API credentials
3. ⏳ Update API URLs and parsing logic
4. ⏳ Test with real data
5. ⏳ Document response structures
6. ⏳ Performance testing
7. ⏳ Consider caching strategy
8. ⏳ Decide on rate limiting

## Notes
- All TODO comments in code indicate where you need to add API-specific logic
- The `rawData` field in responses helps during spike for analyzing API responses
- Consider implementing caching for frequently requested routes
- Rate limiting might be needed depending on API quotas

