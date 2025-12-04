
import { LocationFill } from '@/assets/icons/LocationFill';
import { DirectionsBusFilledOutlined, DirectionsSubwayFilledOutlined, DirectionsCarFilledOutlined } from '@mui/icons-material';

interface PlanCardProps {
  type: string;
  name: string;
  duration: string;
  estTime: string;
  summary: string;
  locationIndex?: number;
}

const iconList = [
  {type: "location", icon: LocationFill},
  {type: "bus", icon: DirectionsBusFilledOutlined},
  {type: "subway", icon: DirectionsSubwayFilledOutlined},
  {type: "car", icon: DirectionsCarFilledOutlined}
];
const transportation = ["bus", "subway", "car"];

export default function PlanCard({
  type,
  name,
  duration,
  estTime,
  summary,
  locationIndex,
}: PlanCardProps) {


  const displayingIcon = iconList.find(item => item.type === type);
  const IconComponent = displayingIcon ? displayingIcon.icon : null;

  return (
    <div className='flex gap-3.5 justify-start items-start group-hover:gap-4 transition-all duration-300'>
      <div className='w-12 min-w-12 h-12 flex justify-center items-center text-primary shrink-0 transition-transform duration-300 group-hover:scale-110'> 
        {IconComponent && (
          type === "location" ? (
            <div className="relative flex justify-center items-center w-12 h-12">
              {/* The Pin Icon */}
              <IconComponent className="w-12 h-12 text-primary transition-all duration-300 group-hover:drop-shadow-lg" />
              
              {/* The Number Centered */}
              <span className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-light-text paragraph-p2-bold transition-transform duration-300 group-hover:scale-110">
                {locationIndex}
              </span>
            </div>
          ) : (
            // For Bus/Subway/Car
            <IconComponent className="text-2xl transition-transform duration-300 group-hover:scale-110" />
          )
        )}


      </div>
      <div className='w-full flex flex-col gap-1.5'>
        <div className='flex flex-col gap-1.5'>
          <p className='flex justify-between paragraph-p2-bold text-dark-text transition-colors duration-300 group-hover:text-primary'>{name} <span className='paragraph-p3-medium text-secondary transition-colors duration-300 group-hover:text-primary/80'>{duration}</span></p>
          <p className='w-full flex justify-between paragraph-p4-medium text-sub-text transition-colors duration-300 group-hover:text-dark-text'>Est. {estTime}</p>
        </div>
        {type === "location" && (
          <div className="transition-all duration-300 group-hover:translate-x-1">
            <p className='paragraph-p3-regular text-dark-text'>{summary}</p>
          </div>
        )}
      </div>
      {/* Expanded content (Details) */}
      <div>

      </div>
    </div>
  );
}
