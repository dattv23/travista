
import { DirectionsBusFilledOutlined, DirectionsSubwayFilledOutlined, StorefrontOutlined, FmdGoodOutlined } from '@mui/icons-material';

interface PlanCardProps {
  type: string;
  name: string;
  duration: string;
  estTime: string;
  summary: string;
  numberOfStops: number | null;
}

export default function PlanCard({
  type,
  name,
  duration,
  estTime,
  summary,
  numberOfStops,
}: PlanCardProps) {


  const normaltype = ["restaurant", "attraction"].includes(type) ? "location" : type;

  const iconList = [
    {type: "location", icon: <FmdGoodOutlined />},
    {type: "bus", icon: <DirectionsBusFilledOutlined />},
    {type: "subway", icon: <DirectionsSubwayFilledOutlined />},
  ];
  const transportation = ["bus", "subway"];

  const displayingIcon = iconList.find(item => item.type === normaltype);


  return (
    <div className='flex gap-3.5 justify-start items-start'>
      <div className='text-primary'>
        {displayingIcon ? displayingIcon.icon : "No icon"}
      </div>
      <div className='w-full flex flex-col gap-1.5'>
        <div className='flex flex-col gap-1.5'>
          <p className='flex justify-between paragraph-p2-bold text-dark-text'>{name} <span className='paragraph-p3-medium text-secondary'>{duration}</span></p>
          <p className='w-full flex justify-between paragraph-p4-medium text-sub-text'>Est. {estTime} {type in transportation && <span >{numberOfStops}</span>}</p>
        </div>
        {normaltype === "location" && (
          <div>
            <p className='paragraph-p3-regular text-dark-text'>Summary: {summary}</p>
          </div>
        )}
      </div>
      {/* Expanded content (Details) */}
      <div>

      </div>
    </div>
  );
}
