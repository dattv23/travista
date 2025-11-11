# Location Module - Geocoding & Directions

## Overview
This module handles location-based operations for the Travista application:
- **Geocoding**: Converting addresses to geographic coordinates
- **Directions**: Getting route information between two points

## Files Structure

```
location/
├── location.service.ts      # Core business logic & external API integration
├── location.controller.ts   # HTTP request/response handlers
├── location.route.ts        # Express route definitions
├── location.validation.ts   # Zod validation schemas
└── README.md               # This file
```

## Quick Start

### 1. Install Dependencies
```bash
npm install axios
```

### 2. Configure Environment Variables
Add to your `.env` file:
```env
GEOCODING_API_URL=https://your-api-provider.com/geocode
DIRECTIONS_API_URL=https://your-api-provider.com/directions
LOCATION_API_KEY=your_api_key_here
```

### 3. Start the Server
```bash
npm run dev
```

## API Endpoints

### 1. Geocode Address → Coordinates
```http
POST /api/location/geocode
Content-Type: application/json

{
  "address": "Nhà thờ Đức Bà, Quận 1, TP. HCM"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "Nhà thờ Đức Bà, Quận 1, TP. HCM",
    "coordinates": {
      "lat": 10.8231,
      "lng": 106.6297
    },
    "formattedAddress": "Notre-Dame Cathedral Basilica of Saigon, District 1, Ho Chi Minh City"
  },
  "message": "Address geocoded successfully"
}
```

### 2. Get Directions by Coordinates
```http
POST /api/location/directions
Content-Type: application/json

{
  "origin": { "lat": 10.8231, "lng": 106.6297 },
  "destination": { "lat": 10.7769, "lng": 106.7009 }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "origin": { "lat": 10.8231, "lng": 106.6297 },
    "destination": { "lat": 10.7769, "lng": 106.7009 },
    "distance": "8.5 km",
    "duration": "15 mins",
    "steps": [...],
    "polyline": "encoded_polyline_string",
    "rawData": { /* full API response for analysis */ }
  },
  "message": "Directions retrieved successfully"
}
```

### 3. Get Directions by Address
```http
POST /api/location/directions-by-address
Content-Type: application/json

{
  "originAddress": "Chợ Bến Thành, TP. HCM",
  "destinationAddress": "Sân bay Tân Sơn Nhất, TP. HCM"
}
```

## Integration with Different API Providers

### Google Maps API
1. Enable "Geocoding API" and "Directions API" in Google Cloud Console
2. Get API key
3. Update `location.service.ts`:

```typescript
this.geocodingApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
this.directionsApiUrl = 'https://maps.googleapis.com/maps/api/directions/json'
```

4. Update request params:
```typescript
// For geocoding
params: {
  address: address,
  key: this.apiKey,
  language: 'vi' // for Vietnamese
}

// For directions
params: {
  origin: `${origin.lat},${origin.lng}`,
  destination: `${destination.lat},${destination.lng}`,
  key: this.apiKey,
  mode: 'driving',
  language: 'vi'
}
```

### Goong.io API (Vietnamese Service)
1. Sign up at https://goong.io
2. Get API key
3. Update URLs:

```typescript
this.geocodingApiUrl = 'https://rsapi.goong.io/geocode'
this.directionsApiUrl = 'https://rsapi.goong.io/Direction'
```

4. Update request params according to Goong documentation

### Mapbox API
1. Sign up at https://mapbox.com
2. Get access token
3. Update URLs:

```typescript
this.geocodingApiUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places'
this.directionsApiUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving'
```

## Response Parsing

When you integrate with an actual API, you'll need to update the response parsing logic in `location.service.ts`:

```typescript
// Example for Google Maps
const result: GeocodeResult = {
  address: address,
  coordinates: {
    lat: response.data.results[0].geometry.location.lat,
    lng: response.data.results[0].geometry.location.lng,
  },
  formattedAddress: response.data.results[0].formatted_address,
}
```

Look for TODO comments in the service file for exact locations to update.

## Validation

The module uses Zod for request validation:

- **Coordinates**: Must be valid lat (-90 to 90) and lng (-180 to 180)
- **Addresses**: Must be non-empty strings, max 500 characters
- Invalid requests return 400 Bad Request with detailed error messages

## Error Handling

- Network timeouts: 10s for geocoding, 15s for directions
- All errors are logged via Winston
- Errors propagate to global error handler
- Client receives structured error responses

## Testing

Use the included Postman collection: `backend/location-api-tests.json`

Or use curl:

```bash
# Test geocoding
curl -X POST http://localhost:5000/api/location/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"Chợ Bến Thành, TP. HCM"}'

# Test directions
curl -X POST http://localhost:5000/api/location/directions \
  -H "Content-Type: application/json" \
  -d '{"origin":{"lat":10.8231,"lng":106.6297},"destination":{"lat":10.7769,"lng":106.7009}}'
```

## Performance Considerations

### Caching Strategy
Consider implementing caching for:
- Frequently requested addresses (geocoding)
- Popular routes (directions)
- Use Redis for distributed caching

Example:
```typescript
// Check cache first
const cached = await redis.get(`geocode:${address}`)
if (cached) return JSON.parse(cached)

// If not cached, call API and cache result
const result = await callGeocodingAPI(address)
await redis.setex(`geocode:${address}`, 86400, JSON.stringify(result)) // 24h TTL
```

### Rate Limiting
Most APIs have rate limits. Consider:
- Implementing request queuing
- Adding rate limit middleware
- Monitoring usage

## Next Steps for Production

- [ ] Choose and integrate actual API provider
- [ ] Implement caching strategy
- [ ] Add rate limiting
- [ ] Add retry logic for failed requests
- [ ] Monitor API quota usage
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Document API response structures
- [ ] Consider fallback API provider
- [ ] Add metrics/monitoring

## Dependencies

- `axios`: HTTP client for API requests
- `zod`: Request validation
- `winston`: Logging (via project config)
- `express`: Web framework (via project)

## Notes

- The `rawData` field in responses includes the full API response for spike analysis
- All coordinates use decimal degrees format
- Distance and duration formats depend on the API provider
- Consider implementing batch geocoding for multiple addresses

