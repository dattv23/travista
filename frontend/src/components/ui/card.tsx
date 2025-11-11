interface CardProps {
  type: string;
  title: string;
  duration: string;
  estTime: string;
  summary: string;
  numberOfStops: number | null;
}

export default function Card({
  type,
  title,
  duration,
  estTime,
  summary,
  numberOfStops,
}: CardProps) {

  const iconList = [
    {type: "location", icon: ""},
    {type: "bus", icon: ""},
    {type: "subway", icon: ""},
  ];
  const transportation = ["bus", "subway"];

  const displayingIcon = iconList.find(item => item.type === type);


  return (
    <div>
      <div>
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
