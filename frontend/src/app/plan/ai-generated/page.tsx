

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
      </section>
    </>
  );
}