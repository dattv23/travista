import PlanUI from './plan'; 

// === TEST DATA ===
const MY_ITINERARY = [
  { lat: 37.5665, lng: 126.9780 }, // 1. City Hall
  { lat: 37.5796, lng: 126.9770 }, // 2. Gyeongbok Palace
  { lat: 37.5512, lng: 126.9882 }, // 3. Myeongdong
];

// Định nghĩa kiểu cho props của trang
interface PageProps {
  searchParams: {
    location: string;
    date: string;
    duration: string;
    people: string;
    budget: string;
    theme: string;
  }
}


// SERVER COMPONENT (async)
export default async function GeneratedPlanPage({ searchParams }: PageProps) {

  const initialItinerary = MY_ITINERARY;

  return (
    <PlanUI 
      searchParams={searchParams} 
      initialItinerary={initialItinerary} 
    />
  );
}