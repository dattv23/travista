import { MapPin } from 'lucide-react';
import { CommandItem } from '@/components/ui/command';
import { SearchResult } from '@/types/location';

interface LocationItemProps {
  place: SearchResult;
  onSelect: (roadAddress: string) => void;
}

export function LocationItem({ place, onSelect }: LocationItemProps) {
  return (
    <CommandItem
      className="hover:bg-accent flex cursor-pointer gap-2 rounded-md px-2 py-3"
      onSelect={() => onSelect(place.roadAddress)}
    >
      <MapPin className="mt-1 h-4 w-4 shrink-0 text-blue-500" />

      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{place.roadAddress}</span>
        <span className="text-muted-foreground text-xs">
          {place.englishAddress || place.jibunAddress}
        </span>
      </div>
    </CommandItem>
  );
}
