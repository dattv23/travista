# 🚀 Quick Start - Location API Spike

## ⚡ Get Started in 3 Steps

### 1️⃣ Install Dependencies
```bash
cd backend
npm install axios
```

### 2️⃣ Add API Credentials to `.env`

Choose ONE option:

```env
# Option A: Google Maps
GOOGLE_MAPS_API_KEY=your_key_here

# Option B: Goong.io (Recommended for Vietnam)
GOONG_API_KEY=your_key_here

# Option C: Mapbox
MAPBOX_ACCESS_TOKEN=your_token_here
```

### 3️⃣ Integrate API Code

Open these two files side by side:
- `src/modules/location/api-examples.ts` (copy from here)
- `src/modules/location/location.service.ts` (paste here)

Copy the methods for your chosen provider into `location.service.ts`

## ✅ That's It!

Start your server:
```bash
npm run dev
```

Test the endpoints:
```bash
curl -X POST http://localhost:5000/api/location/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"Chợ Bến Thành, TP. HCM"}'
```

## 📖 Need More Details?

- **Complete Guide**: See `SPIKE_SUMMARY.md`
- **API Examples**: See `src/modules/location/api-examples.ts`
- **Module Docs**: See `src/modules/location/README.md`
- **Test Collection**: Import `location-api-tests.json` into Postman

## 🎯 Quick Test Commands

```bash
# Test 1: Geocode an address
curl -X POST http://localhost:5000/api/location/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"Nhà thờ Đức Bà, Quận 1, TP. HCM"}'

# Test 2: Get directions by coordinates
curl -X POST http://localhost:5000/api/location/directions \
  -H "Content-Type: application/json" \
  -d '{"origin":{"lat":10.8231,"lng":106.6297},"destination":{"lat":10.7769,"lng":106.7009}}'

# Test 3: Get directions by address
curl -X POST http://localhost:5000/api/location/directions-by-address \
  -H "Content-Type: application/json" \
  -d '{"originAddress":"Chợ Bến Thành, TP. HCM","destinationAddress":"Sân bay Tân Sơn Nhất"}'
```

## 🔥 Popular Vietnamese Addresses for Testing

```json
{
  "addresses": [
    "Chợ Bến Thành, Quận 1, TP. Hồ Chí Minh",
    "Nhà thờ Đức Bà, Quận 1, TP. Hồ Chí Minh",
    "Sân bay Tân Sơn Nhất, TP. Hồ Chí Minh",
    "Dinh Độc Lập, Quận 1, TP. Hồ Chí Minh",
    "Bưu điện Thành phố, Quận 1, TP. Hồ Chí Minh"
  ]
}
```

