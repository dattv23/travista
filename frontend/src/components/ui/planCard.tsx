
import { DirectionsBusFilledOutlined, DirectionsSubwayFilledOutlined, StorefrontOutlined } from '@mui/icons-material';

interface PlanCardProps {
  type: string;
  title: string;
  duration: string;
  estTime: string;
  summary: string;
  numberOfStops: number | null;
}

export default function PlanCard({
  type,
  title,
  duration,
  estTime,
  summary,
  numberOfStops,
}: PlanCardProps) {

  const iconList = [
    {type: "location", icon: ""},
    {type: "bus", icon: <DirectionsBusFilledOutlined />},
    {type: "subway", icon: <DirectionsSubwayFilledOutlined />},
  ];
  const transportation = ["bus", "subway"];

  const displayingIcon = iconList.find(item => item.type === type);


  return (
    <div className='flex gap-2 justify-start items-start'>
      <div className='text-primary'>
        {displayingIcon ? displayingIcon.icon : "No icon"}
      </div>
      <div>
        <div>
          <p>{title} <span>{duration}</span></p>
          <p>Est. {estTime} {type in transportation && <span>{numberOfStops}</span>}</p>
        </div>
        {type === "location" && (
          <div>
            <p>{summary}</p>
          </div>
        )}
        {/* Expanded content (Details) */}
        <div>

        </div>
      </div>
    </div>
  );
}
