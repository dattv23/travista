import PlanUI from './plan';
import { plannerService, ItineraryResponse } from '@/services/plannerService';

interface PageProps {
  searchParams: {
    location: string; // Should be "lat,lng" format
    date: string; // ISO date string
    duration: string; // Number as string, e.g. "3"
    people: string;
    budget: string;
    theme: string;
  }
}

// Helper function to parse location string
function parseLocation(location: string): { lat: number; lng: number } {
  const [lat, lng] = location.split(',').map(Number);
  return { lat, lng };
}

// SERVER COMPONENT (async)
export default async function GeneratedPlanPage({ searchParams }: PageProps) {
  let itineraryData: ItineraryResponse | null = null;
  let error: string | null = null;

  try {
    // Parse the location from searchParams
    const destination = parseLocation(searchParams.location);
    
    // Prepare user input for the planner API
    const userInput = {
      destination,
      startDate: searchParams.date,
      numberOfDays: parseInt(searchParams.duration, 10),
      people: searchParams.people,
      budget: searchParams.budget,
      theme: searchParams.theme
    };

    console.log('🎯 Fetching itinerary from planner API...');
    
    // Call the planner API to generate the itinerary
    itineraryData = await plannerService.createItinerary(userInput);
    
    console.log('✅ Itinerary data received:', itineraryData);
  } catch (err: any) {
    console.error('❌ Error fetching itinerary:', err);
    error = err.message || 'Failed to generate itinerary';
  }

  return (
    <PlanUI 
      searchParams={searchParams}
      itineraryData={itineraryData}
      error={error}
    />
  );
}