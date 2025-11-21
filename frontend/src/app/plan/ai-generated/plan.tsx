"use client";

import { ArrowCircleLeft } from '@mui/icons-material';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AddModal } from '@/components/ui/addModal';
import PlanCard from '@/components/ui/planCard';
import { useModal } from '@/hooks/useModal';
import { SummaryModal } from '@/components/ui/summaryModal';
import { ReviewSummaryData } from '@/types/review';

interface MapPoint {
  lat: number,
  lng: number,
}

interface PlanClientUIProps {
  searchParams: {
    location: string;
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

  const addModal = useModal();
  const summaryModal = useModal();

  const [itinerary, setItinerary] = useState(initialItinerary);
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
            {mockPlanData.map((plan, index) => {
              const locationOrder = mockPlanData.slice(0, index + 1).filter(p => p.type === 'location').length;
              return (
              <div 
                key={index} 
                className={`w-full p-2 bg-white rounded-[8px] shadow-sm transition-colors border border-transparent hover:border-primary ${
                  plan.type === 'location' ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                }`}
                // 2. Logic for click: Only fetch and open if it's a location
                onClick={() => {
                  if (plan.type === 'location') {
                    handleGetSummary(plan.name); // This fetches data AND opens the modal
                  }
                }}
              >
                <PlanCard
                  type={plan.type}
                  name={plan.name}
                  duration={plan.duration}
                  estTime={plan.estTime}
                  summary={plan.summary}
                  numberOfStops={plan.numberOfStops}
                  locationIndex={plan.type === 'location' ? locationOrder : undefined}
                />
              </div>
            )})}
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
          <DynamicNaverMap
            path={itinerary}
          />
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