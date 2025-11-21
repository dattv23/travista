"use client";

import { ArrowCircleLeft } from '@mui/icons-material';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { AddModal } from '@/components/ui/addModal';
import PlanCard from '@/components/ui/planCard';
import { useModal } from '@/hooks/useModal';
import { SummaryModal } from '@/components/ui/summaryModal';
import { ReviewSummaryData } from '@/types/review';
import { usePlanner } from '@/hooks/usePlanner';
import { PlannerRequest } from '@/types/planner';

interface MapPoint {
  lat: number;
  lng: number;
}

interface PlanClientUIProps {
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
  initialItinerary: MapPoint[];
}

const mockPlanData = [
  {
    type: "location",
    name: "Hongik University (Hongdae)",
    duration: "09:00 - 13:00",
    estTime: "4 hours",
    summary: "The heart of indie music, street art, and fashion. Perfect for finding unique clothes and watching busking.",
    numberOfStops: null,
  },
  {
    type: "bus",
    name: "Bus 273",
    duration: "13:00 - 13:20",
    estTime: "20 mins",
    summary: "",
    numberOfStops: 4,
  },
  {
    type: "location",
    name: "Yeonnam-dong Park", 
    duration: "13:20 - 15:20",
    estTime: "1 hour",
    summary: "A trendy neighborhood known for its cafe culture and the Gyeongui Line Forest Park.",
    numberOfStops: null,
  },
  {
    type: "subway",
    name: "Subway Line 2",
    duration: "15:20 - 15:50",
    estTime: "30 mins",
    summary: "",
    numberOfStops: 4,
  },
  {
    type: "location",
    name: "The Hyundai Seoul",
    duration: "16:00 - 19:00",
    estTime: "3 hours",
    summary: "Seoul's largest department store, featuring an indoor garden and contemporary architecture.",
    numberOfStops: null,
  },
  {
    type: "location",
    name: "Hongik University (Hongdae)",
    duration: "09:00 - 13:00",
    estTime: "4 hours",
    summary: "The heart of indie music, street art, and fashion. Perfect for finding unique clothes and watching busking.",
    numberOfStops: null,
  },
  {
    type: "bus",
    name: "Bus 273",
    duration: "13:00 - 13:20",
    estTime: "20 mins",
    summary: "",
    numberOfStops: 4,
  },
  {
    type: "location",
    name: "Yeonnam-dong Park", 
    duration: "13:20 - 15:20",
    estTime: "1 hour",
    summary: "A trendy neighborhood known for its cafe culture and the Gyeongui Line Forest Park.",
    numberOfStops: null,
  },
  {
    type: "subway",
    name: "Subway Line 2",
    duration: "15:20 - 15:50",
    estTime: "30 mins",
    summary: "",
    numberOfStops: 4,
  },
  {
    type: "location",
    name: "The Hyundai Seoul",
    duration: "16:00 - 19:00",
    estTime: "3 hours",
    summary: "Seoul's largest department store, featuring an indoor garden and contemporary architecture.",
    numberOfStops: null,
  },
];

const DynamicNaverMap = dynamic(
  () => import('@/components/map/NaverMap'),
  {
    ssr: false,
    loading: () => <div style={{width: '100%', height: '100%', background: '#eee'}} />
  }
)

export default function PlanUI({ searchParams, initialItinerary }: PlanClientUIProps) {
  const { isLoading, error, itinerary: plannerItinerary, pins, createItinerary } = usePlanner();
  const addModal = useModal();
  const summaryModal = useModal();

  const [itinerary, setItinerary] = useState(initialItinerary);

  // Prevent double fetching
  const hasInitiatedRef = useRef(false);

  const generatePlan = useCallback(() => {
    if (!initialItinerary.length || !initialItinerary[0].lat || !initialItinerary[0].lng) {
      console.error("Missing coordinates for itinerary generation");
      return;
    }

    const lat = initialItinerary[0].lat;
    const lng = initialItinerary[0].lng;

    console.log('Triggering AI Planner:', { lat, lng });

    const durationMatch = searchParams.duration?.match(/(\d+)/);
    const numberOfDays = durationMatch ? parseInt(durationMatch[1]) : 1;

    let startDate = searchParams.date;
    if (startDate.includes('/')) {
      const [day, month, year] = startDate.split('/');
      startDate = `${year}-${month}-${day}`;
    }

    const request: PlannerRequest = {
      destination: { lat: lat, lng: lng },
      startDate: startDate,
      numberOfDays: numberOfDays,
      people: searchParams.people,
      budget: searchParams.budget,
      theme: searchParams.theme,
    };

    console.log('Request: ', request)

    createItinerary(request)
      .then(() => console.log('AI Itinerary Generated Successfully'))
      .catch((err) => console.error('AI Generation Failed:', err));

  }, [initialItinerary, searchParams, createItinerary]);

  useEffect(() => {
    if (!hasInitiatedRef.current) {
      hasInitiatedRef.current = true;
      generatePlan();
    }
  }, [generatePlan]);

  // Update map when data comes back
  useEffect(() => {
    if (plannerItinerary && plannerItinerary.places.length > 0) {
      const mapPoints: MapPoint[] = [
        {
          lat: Number(plannerItinerary.userInput.destination.lat), 
          lng: Number(plannerItinerary.userInput.destination.lng),
        },
        ...plannerItinerary.places.map((place) => ({
          lat: place.lat,
          lng: place.lng,
        })),
      ];
      setItinerary(mapPoints);
    }
  }, [plannerItinerary]);

  const handleRetry = () => {
    console.log("Retrying generation...");
    generatePlan();
  };
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<ReviewSummaryData | null>(null);

  const handleGetSummary = async (locationName: string) => {
    setIsLoadingSummary(true);
    setSummaryData(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/reviews/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationName }), 
      });

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const data = await response.json();
      setSummaryData(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleAddNewStop = (newStop: MapPoint) => {
    setItinerary([...itinerary, newStop]);
  }

  return (
    <>
      <section className="w-full min-h-screen pt-[92px] flex ">
        {/* left section */}
        <div className='w-1/3 bgb-transparent shadow-xl px-[18px] h-screen flex flex-col'>
          <div className='pt-4'>
            {/* Title */}
            <div>
              {/* buttons */}
              <div className='mb-4'>
                <Link 
                  href={''} 
                  className='flex items-center justify-center max-w-max text-primary p-2 rounded-full transition hover:text-[color-mix(in_srgb,var(--color-primary),black_10%)] hover:bg-[color-mix(in_srgb,var(--color-background),black_10%)]'
                >
                  <ArrowCircleLeft />
                </Link>
              </div>
              <p className="paragraph-p1-semibold text-dark-text">Your Itinerary</p>
            </div>
            <div className='flex items-start pt-2 gap-6'>
              <div className='flex flex-col gap-2'>
                <p className="paragraph-p3-medium text-dark-text">{searchParams.theme} itinerary</p>
                <p className="paragraph-p3-medium text-sub-text">Start date: {searchParams.date}</p>
                <p className="paragraph-p3-medium text-sub-text">Est. 15 hours (5 locations)</p>
              </div>
              <div className='flex flex-col gap-2'>
                <p className="paragraph-p3-medium text-sub-text">{searchParams.people}</p>
                <p className="paragraph-p3-medium text-sub-text">Duration: {searchParams.duration}</p>
                <p className="paragraph-p3-medium text-sub-text">Budget: {searchParams.budget}</p>
              </div>
            </div>
            <div className='flex justify-between mt-5'>
              <button></button>
              <div className='paragraph-p3-medium flex gap-5'>
                <button
                  className='bg-transparent text-primary p-2.5 border-2 border-primary rounded-[8px] transition cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-background),black_10%)]'
                >
                  Edit plan
                </button>
                <button
                  className='bg-primary text-light-text p-2.5 border-2 border-primary rounded-[8px] transition cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)]'
                  onClick={addModal.open}
                >
                  Add new stop
                </button>
              </div>
            </div>
          </div>
          <hr className='text-divider m-2.5'/>
          {/* Main Content Area */}
          <div className='flex-1 overflow-y-auto flex flex-col gap-4 pb-10'>
            {isLoading && (
              <div className='w-full p-4 text-center'>
                <p className='text-sub-text'>Generating your {searchParams.theme} itinerary...</p>
              </div>
            )}
            
            {error && (
              <div className='rounded-lg p-4 text-center'>
                <p className="text-red-600 text-sm mb-3">Failed to generate plan.</p>
                <p className="text-xs text-red-400 mb-3">{typeof error === 'string' ? error : 'Timeout or Server Error'}</p>
                <button onClick={handleRetry} className='flex items-center justify-center gap-2 w-full bg-primary text-light-text py-2 rounded-md text-sm hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)] transition cursor-pointer'>
                  Try Again
                </button>
              </div>
            )}

            {!isLoading && !error && plannerItinerary?.places.length && (
              plannerItinerary.places.map((place, index) => (
                <div key={index} className='w-full p-2 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition'>
                  <PlanCard
                    type="location"
                    name={place.name}
                    duration={`Stop ${index + 1}`}
                    estTime="~2 hours"
                    summary={place.address}
                    numberOfStops={null}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map */}
        <div className='w-2/3 bg-gray-400 h-screen relative'>
          <SummaryModal 
            isOpen={summaryModal.isOpen} 
            onClose={summaryModal.close} 
            isLoading={isLoadingSummary}
            data={summaryData}
          />
          {/* <DynamicNaverMap
            path={itinerary}
          /> */}
        </div>
      </section>

      {addModal.isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-dark-text/20'>
          <AddModal isOpen={addModal.isOpen} onClose={addModal.close}/>
        </div>
      )}
    </>
  );
}