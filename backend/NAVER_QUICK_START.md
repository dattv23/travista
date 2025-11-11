# 🚀 Naver Maps API - Quick Start

## ⚡ Get Running in 3 Minutes

### 1️⃣ Get Your API Keys (2 minutes)

1. Visit: https://console.ncloud.com/
2. Sign up or log in
3. Go to: **Console** → **AI·NAVER API** → **Application**
4. Click **"애플리케이션 등록"** (Register Application)
5. Enable **"Maps"** service
6. Copy your keys:
   - **Client ID** = `NAVER_MAPS_API_KEY_ID`
   - **Client Secret** = `NAVER_MAPS_API_KEY`

### 2️⃣ Configure (30 seconds)

Create/update `.env` file:

```env
NAVER_MAPS_API_KEY_ID=your_client_id_here
NAVER_MAPS_API_KEY=your_client_secret_here
```

### 3️⃣ Install & Run (30 seconds)

```bash
npm install axios
npm run dev
```

## ✅ Test It!

### Test 1: Geocode Korean Address
```bash
curl -X POST http://localhost:5000/api/location/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"네이버 그린팩토리"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "coordinates": {
      "lat": 37.3595963,
      "lng": 127.1054328
    },
    "formattedAddress": "NAVER Green Factory, 6 Buljeong-ro, Bundang-gu..."
  }
}
```

### Test 2: Geocode English Address
```bash
curl -X POST http://localhost:5000/api/location/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"Seoul City Hall"}'
```

### Test 3: Get Directions
```bash
curl -X POST http://localhost:5000/api/location/directions \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"lat": 37.3595963, "lng": 127.1054328},
    "destination": {"lat": 37.5665, "lng": 126.9780}
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "distance": "35.2 km",
    "duration": "42 mins",
    "polyline": [[127.105, 37.359], ...]
  }
}
```

### Test 4: Get Directions by Address
```bash
curl -X POST http://localhost:5000/api/location/directions-by-address \
  -H "Content-Type: application/json" \
  -d '{
    "originAddress": "NAVER Green Factory",
    "destinationAddress": "Seoul City Hall"
  }'
```

## 📝 Quick Test Addresses

### Korean Addresses
```
네이버 그린팩토리
서울시청
강남역
부산역
제주공항
```

### English Addresses
```
NAVER Green Factory, Seongnam
Seoul City Hall
Gangnam Station, Seoul
Busan Station
Jeju Airport
```

### Vietnam Addresses (to test coverage)
```
Chợ Bến Thành, TP. Hồ Chí Minh
Phố cổ Hà Nội
Sân bay Tân Sơn Nhất
```

## 🎯 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/location/geocode` | POST | Address → Coordinates |
| `/api/location/directions` | POST | Route by coordinates |
| `/api/location/directions-by-address` | POST | Route by addresses |

## 📦 What You Get

- ✅ Geocoding (address → coordinates)
- ✅ Reverse Geocoding (coordinates → address)
- ✅ Driving Directions
- ✅ Korean & English language support
- ✅ Road address + Jibun address
- ✅ Distance & duration
- ✅ Turn-by-turn steps
- ✅ Polyline coordinates

## 🌏 Coverage

- ✅ **Excellent**: South Korea
- ✅ **Good**: Japan, Major Asian cities
- ⚠️ **Limited**: Vietnam (major cities only)
- ⚠️ **Minimal**: Outside Asia

## 💡 Pro Tips

### Get Korean Response
```typescript
// In naver-maps.service.ts, change 'eng' to 'kor'
await naverMapsService.geocode(address, 'kor')
```

### Avoid Toll Roads
```typescript
await naverMapsService.getDirections(origin, destination, {
  option: 'trafast',
  avoid: 'toll'
})
```

### Shortest Route
```typescript
await naverMapsService.getDirections(origin, destination, {
  option: 'traoptimal'  // shortest distance
})
```

## 🚨 Common Issues

### ❌ 401 Unauthorized
**Solution**: Check your API keys in `.env`

### ❌ No results found
**Solution**: Try more specific address or use English

### ❌ Module not found: axios
**Solution**: Run `npm install axios`

## 📚 Full Documentation

- **Setup Guide**: `NAVER_MAPS_SETUP.md`
- **Tests**: Import `location-api-tests-naver.json` into Postman
- **API Docs**: https://api.ncloud-docs.com/

## 🎉 You're Done!

Your Naver Maps integration is ready to use. Start testing with real addresses!

---

**Next Steps:**
1. Test with your target locations (Vietnam addresses)
2. Monitor response times and accuracy
3. Check API usage limits
4. Decide if Naver Maps coverage is sufficient for your needs
5. Consider fallback API if Vietnam coverage is insufficient

