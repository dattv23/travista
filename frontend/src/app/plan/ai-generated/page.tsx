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
      <section className="w-full min-h-screen pt-[92px] flex ">
        {/* left section */}
        <div className='w-1/4 bgb-transparent shadow-xl px-[18px] h-screen'>
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
                >
                  Add new shop
                </button>
              </div>
            </div>
          </div>
          <hr className='text-divider m-2.5'/>
          {/* Main Content Area */}
          <div className='scroll-auto'>
            
          </div>
        </div>

        {/* Map */}
        <div className='w-3/4 bg-gray-400 h-screen'>

        </div>
      </section>
    </>
  );
}