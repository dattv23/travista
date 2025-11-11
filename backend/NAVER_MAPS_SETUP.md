# 🗺️ Naver Cloud Platform Maps API - Setup Guide

## Overview

Your Travista backend is now integrated with **Naver Cloud Platform Maps API**, which provides:
- ✅ **Geocoding**: Convert addresses to coordinates
- ✅ **Reverse Geocoding**: Convert coordinates to addresses
- ✅ **Directions**: Get driving routes between two points

## Why Naver Maps?

- ✅ **Excellent Coverage**: Great for Korea, Japan, and Southeast Asia
- ✅ **Reliable**: Enterprise-grade service from Naver (Korean tech giant)
- ✅ **Good Pricing**: Competitive pricing with free tier
- ✅ **Well Documented**: Clear English documentation
- ✅ **Multiple Languages**: Supports Korean and English responses

## 🚀 Quick Setup (3 Steps)

### Step 1: Get API Credentials

1. **Sign up** at [Naver Cloud Platform](https://www.ncloud.com/)
2. Go to **Console** > **AI·NAVER API** > **Application**
3. Click **"Create Application"**
4. Enable **"Maps"** service (both Geocoding and Directions)
5. Copy your credentials:
   - **Client ID** → This is your `NAVER_MAPS_API_KEY_ID`
   - **Client Secret** → This is your `NAVER_MAPS_API_KEY`

### Step 2: Configure Environment Variables

Copy `.env.naver-example` to `.env` and add your credentials:

```env
NAVER_MAPS_API_KEY_ID=your_client_id_here
NAVER_MAPS_API_KEY=your_client_secret_here
```

### Step 3: Install Dependencies & Start

```bash
# Install axios (if not already installed)
npm install axios

# Start the server
npm run dev
```

## 🎯 API Endpoints

### 1. Geocode Address → Coordinates

```http
POST /api/location/geocode
Content-Type: application/json

{
  "address": "NAVER Green Factory, 6 Buljeong-ro, Bundang-gu, Seongnam-si"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "NAVER Green Factory, 6 Buljeong-ro, Bundang-gu, Seongnam-si",
    "coordinates": {
      "lat": 37.3595963,
      "lng": 127.1054328
    },
    "formattedAddress": "NAVER Green Factory, 6 Buljeong-ro, Bundang-gu, Seongnam-si, Gyeonggi-do",
    "roadAddress": "NAVER Green Factory, 6 Buljeong-ro, Bundang-gu, Seongnam-si, Gyeonggi-do",
    "jibunAddress": "NAVER Green Factory, 178-1, Jeongja-dong, Bundang-gu, Seongnam-si, Gyeonggi-do",
    "englishAddress": "6, Buljeong-ro, Bundang-gu, Seongnam-si, Gyeonggi-do, Republic of Korea"
  },
  "message": "Address geocoded successfully"
}
```

### 2. Get Directions (by Coordinates)

```http
POST /api/location/directions
Content-Type: application/json

{
  "origin": { "lat": 37.3595963, "lng": 127.1054328 },
  "destination": { "lat": 37.5665, "lng": 126.9780 }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "origin": { "lat": 37.3595963, "lng": 127.1054328 },
    "destination": { "lat": 37.5665, "lng": 126.9780 },
    "distance": "35.2 km",
    "duration": "42 mins",
    "steps": [...],
    "polyline": [[127.1054328, 37.3595963], ...],
    "rawData": { ... }
  },
  "message": "Directions retrieved successfully"
}
```

### 3. Get Directions by Address

```http
POST /api/location/directions-by-address
Content-Type: application/json

{
  "originAddress": "NAVER Green Factory, Seongnam",
  "destinationAddress": "Seoul City Hall"
}
```

## 📚 API Documentation Reference

- **Geocoding API**: https://api.ncloud-docs.com/docs/en/ai-naver-mapsgeocoding-geocode
- **Directions API**: https://api.ncloud-docs.com/docs/en/ai-naver-mapsdirections-driving

## 🧪 Testing

### Test with Korean Address
```bash
curl -X POST http://localhost:5000/api/location/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"네이버 그린팩토리"}'
```

### Test with English Address
```bash
curl -X POST http://localhost:5000/api/location/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"NAVER Green Factory, Seongnam"}'
```

### Test Directions
```bash
curl -X POST http://localhost:5000/api/location/directions \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"lat": 37.3595963, "lng": 127.1054328},
    "destination": {"lat": 37.5665, "lng": 126.9780}
  }'
```

## 🌏 Coverage

Naver Maps works best in:
- ✅ **South Korea**: Excellent coverage with detailed data
- ✅ **Japan**: Good coverage
- ✅ **Southeast Asia**: Decent coverage for major cities
- ⚠️ **Global**: Limited coverage outside Asia

For Vietnam specifically, Naver Maps has coverage for major cities like Hanoi, Ho Chi Minh City, and Da Nang.

## 💡 Features

### Geocoding Options
- **Language**: 'kor' (Korean) or 'eng' (English)
- **Filters**: Filter by administrative codes
- **Pagination**: Support for multiple results

### Directions Options
- **Route Types**:
  - `trafast`: Fastest route (default)
  - `tracomfort`: Most comfortable (balanced)
  - `traoptimal`: Shortest distance
- **Avoid**: toll roads, traffic lights, ferries
- **Waypoints**: Add intermediate stops

### Example with Options
```typescript
// In your code
const result = await naverMapsService.getDirections(
  origin,
  destination,
  {
    option: 'tracomfort', // comfortable route
    avoid: 'toll'        // avoid toll roads
  }
)
```

## 💰 Pricing

Naver Cloud Platform offers competitive pricing:
- **Free Tier**: Available (check current limits on their website)
- **Pay-as-you-go**: Charged per API call
- **Monthly Plans**: Available for high-volume usage

Check pricing: https://www.ncloud.com/product/aiService/maps

## 🔒 Security

- ✅ API keys stored in `.env` (not in git)
- ✅ Headers properly configured
- ✅ Error messages don't expose sensitive data
- ✅ Request timeouts configured

## 📊 Response Format

### Naver Maps Geocoding Response
```json
{
  "status": "OK",
  "meta": {
    "totalCount": 1,
    "page": 1,
    "count": 1
  },
  "addresses": [{
    "roadAddress": "...",
    "jibunAddress": "...",
    "englishAddress": "...",
    "x": "127.1054328",  // longitude
    "y": "37.3595963",   // latitude
    "distance": 0.0
  }]
}
```

### Naver Maps Directions Response
```json
{
  "code": 0,
  "message": "OK",
  "route": {
    "trafast": [{
      "summary": {
        "distance": 35247,      // meters
        "duration": 2520000,    // milliseconds
        "bbox": [[...], [...]]
      },
      "path": [[127.105, 37.359], ...]
    }]
  }
}
```

## 🔧 Advanced Usage

### Custom Language
```typescript
// Get response in Korean
const result = await naverMapsService.geocode('서울시청', 'kor')
```

### Multiple Waypoints
```typescript
const result = await naverMapsService.getDirections(
  origin,
  destination,
  {
    waypoints: '127.0,37.0:127.1,37.1',
    option: 'trafast'
  }
)
```

### Reverse Geocoding
```typescript
const result = await naverMapsService.reverseGeocode({
  lat: 37.5665,
  lng: 126.9780
})
// Returns: "Seoul City Hall, ..."
```

## 🚨 Troubleshooting

### Error: 401 Unauthorized
- Check your API Key ID and API Key in `.env`
- Verify Maps service is enabled in your Naver Cloud Console
- Ensure you're using the correct header names

### Error: 404 Not Found
- Verify the API endpoints are correct
- Check if your account has access to Maps APIs

### Error: No results found
- Try a more specific address
- Check if the address is within Naver Maps coverage area
- Try using English format for better results

### Slow Response Times
- Consider implementing caching (Redis recommended)
- Check your internet connection
- Verify Naver Cloud Platform status

## 📈 Next Steps

- [ ] Test with your target addresses (Vietnam locations)
- [ ] Implement caching for frequently requested routes
- [ ] Add rate limiting
- [ ] Monitor API usage and costs
- [ ] Consider fallback to another provider if needed
- [ ] Add comprehensive error handling
- [ ] Write unit tests

## 🎉 You're Ready!

The Naver Maps integration is complete and ready to use. Just add your API credentials and start testing!

For questions or issues, refer to:
- [Naver Cloud Docs](https://api.ncloud-docs.com/)
- [Support Center](https://www.ncloud.com/support)

