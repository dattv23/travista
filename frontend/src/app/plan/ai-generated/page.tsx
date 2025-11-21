import PlanUI from './plan';

interface PageProps {
  searchParams: {
    location: string;
    lat?: string;
    lng?: string;
    date: string;
    duration: string;
    people: string;
    budget: string;
    theme: string;
  };
}

export default async function GeneratedPlanPage({ searchParams }: PageProps) {
  const lat = searchParams.lat ? parseFloat(searchParams.lat) : null;
  const lng = searchParams.lng ? parseFloat(searchParams.lng) : null;

  console.log('📥 GeneratedPlanPage received:', {
    location: searchParams.location,
    lat,
    lng,
    latStr: searchParams.lat,
    lngStr: searchParams.lng,
    allParams: searchParams,
  });

  const initialItinerary =
    lat && lng && !isNaN(lat) && !isNaN(lng)
      ? [{ lat, lng }]
      : [
          {
            lat: 37.5665,
            lng: 126.9780,
          },
        ];

  console.log('🗺️ Initial Itinerary:', initialItinerary);

  return <PlanUI searchParams={searchParams} initialItinerary={initialItinerary} />;
}