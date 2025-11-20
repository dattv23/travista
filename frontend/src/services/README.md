# Mapper Service

This service handles all route drawing and directions functionality by communicating with the backend mapper API.

## Features

- **Automatic Route Drawing**: Converts location arrays to route paths
- **Street View Integration**: Click on any map pin to see Street View
- **Route Summary**: Display distance, duration, tolls, and fares

## Usage

### In Your Component

```tsx
import { useRouteDrawing } from '@/hooks/useRouteDrawing';

function YourComponent() {
  const { route, loading, error, drawRoute } = useRouteDrawing();
  
  // Automatically draw route when locations change
  useEffect(() => {
    if (locations.length >= 2) {
      drawRoute(locations);
    }
  }, [locations]);

  return (
    <div>
      {route && (
        <div>
          <p>Distance: {route.summary.distance}</p>
          <p>Duration: {route.summary.duration}</p>
        </div>
      )}
      
      <NaverMap 
        path={locations}
        routePath={route?.path}
      />
    </div>
  );
}
```

## File Structure

```
frontend/src/
├── services/
│   └── mapperService.ts       # API calls to backend
├── hooks/
│   └── useRouteDrawing.ts     # React hook for route state
└── components/
    └── map/
        └── NaverMap.tsx       # Map component with markers & Street View
```

## API Endpoints Used

- `POST /api/mapper/draw-route` - Draw route through multiple locations
- `POST /api/mapper/get-directions` - Simple route between two points

## Features Implemented

✅ Automatic route fetching when locations change  
✅ Street View on marker click  
✅ Numbered markers with colors (green=start, red=end, blue=waypoint)  
✅ Hover info windows showing location names  
✅ Route summary display (distance, duration, fares)  
✅ Error handling and loading states  
✅ Auto-fit map bounds to show entire route  

## Limitations

- Maximum 7 locations (start + 5 waypoints + goal)
- Requires at least 2 locations to draw a route
- Locations must be within South Korea (Naver Maps API limitation)

