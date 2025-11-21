import PlanUI from './plan';

interface PageProps {
  searchParams: Promise<{
    location?: string;
    lat?: string;
    lng?: string;
    date?: string;
    duration?: string;
    people?: string;
    budget?: string;
    theme?: string;
  }>;
}

export default async function GeneratedPlanPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const lat = params.lat ? parseFloat(params.lat) : null;
  const lng = params.lng ? parseFloat(params.lng) : null;

  console.log('📥 GeneratedPlanPage received:', {
    location: params.location,
    lat,
    lng,
  });

  const initialItinerary =
    lat && lng && !isNaN(lat) && !isNaN(lng)
      ? [{ lat, lng }]
      : [
          {
            // Default fallback (Seoul City Hall) if coords are missing
            lat: 37.5665,
            lng: 126.9780,
          },
        ];

  const cleanParams = {
    location: params.location || '',
    lat: params.lat,
    lng: params.lng,
    date: params.date || '',
    duration: params.duration || '',
    people: params.people || '',
    budget: params.budget || '',
    theme: params.theme || '',
  };

  console.log('🗺️ Initial Itinerary:', initialItinerary);

  // return <></>

  return <PlanUI searchParams={cleanParams} initialItinerary={initialItinerary} />;
}