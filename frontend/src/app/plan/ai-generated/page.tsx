import { ArrowCircleLeft } from '@mui/icons-material';
import Link from 'next/link';

export default function GeneratedPlan({ 
  searchParams 
}: { 
  searchParams: {
    location: string;
    date: string;
    duration: string;
    people: string;
    budget: string;
    theme: string;
  } 
}) {
  
  return (
    <>
      <section className="w-full min-h-screen px-4 md:px-5 xl:px-8 2xl:px-[220px] pt-[108px]">
        <h1>Generating your itinerary...</h1>
        <p>Building a plan for: <strong>{searchParams.location}</strong></p>
        <p>Theme: <strong>{searchParams.theme}</strong></p>
        <p>Duration: <strong>{searchParams.duration}</strong></p>
        <p>Date: <strong>{searchParams.date}</strong></p>
        <p>Group: <strong>{searchParams.people}</strong></p>
        <p>Budget: <strong>{searchParams.budget}</strong></p>

        {/* left section */}
        <div>
          {/* */}
          <div>
            {/* buttons */}
            <div>
              <Link href={''}><ArrowCircleLeft /></Link>
            </div>
            <div>
              <p className="paragraph-p1-medium">Your Itinerary</p>
              <div >
                <p className="paragraph-p3-medium text-dark-text">{searchParams.theme} itinerary</p>
                <p className="paragraph-p3-regular text-sub-text">{searchParams.date}</p>
                <p className="paragraph-p3-regular text-sub-text">Est. Number of hours (Number of locations)</p>
              </div>
              <div>
                <p className="paragraph-p3-regular text-sub-text">{searchParams.people}</p>
                <p className="paragraph-p3-regular text-sub-text">{searchParams.duration}</p>
                <p className="paragraph-p3-regular text-sub-text">{searchParams.budget}</p>
              </div>
            </div>
            <div>
              <button></button>
              <div>
                <button>Edit plan</button>
                <button>Add new shop</button>
              </div>
            </div>
          </div>
          {/* Main Content Area */}
          <div>
            
          </div>
        </div>

        {/* Map */}
        <div>

        </div>
      </section>
    </>
  );
}