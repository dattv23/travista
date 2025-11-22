'use client';

import { useState } from 'react';
import PlannerMap from './PlannerMap';
import { PlannerResponse, MapPin } from '@/types/planner';

interface PlannerResultProps {
  itinerary: PlannerResponse;
  onPinClick?: (pin: MapPin) => void;
}

export default function PlannerResult({ itinerary, onPinClick }: PlannerResultProps) {
  const [showRestaurants, setShowRestaurants] = useState(false);


  const pins: MapPin[] = [

    {
      lat: itinerary.userInput.destination.lat,
      lng: itinerary.userInput.destination.lng,
      name: 'Destination',
      type: 'destination',
    },

    ...itinerary.places.map((place) => ({
      lat: place.lat,
      lng: place.lng,
      name: place.name,
      type: 'attraction' as const,
    })),

    ...(showRestaurants
      ? itinerary.restaurants.map((restaurant) => ({
          lat: restaurant.lat,
          lng: restaurant.lng,
          name: restaurant.name,
          type: 'restaurant' as const,
        }))
      : []),
  ];

  const handlePinClick = (pin: MapPin) => {
    if (onPinClick) {
      onPinClick(pin);
    } else {

      console.log('Pin clicked:', pin);
    }
  };

  return (
    <div className="w-full space-y-6">

      <div className="w-full">
        <h2 className="text-xl font-bold mb-4">Your Itinerary Map</h2>
        <PlannerMap pins={pins} onPinClick={handlePinClick} />
      </div>

 
      <div className="w-full">
        <h2 className="text-xl font-bold mb-4">
          Tourist Attractions ({itinerary.places.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itinerary.places.map((place, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                handlePinClick({
                  lat: place.lat,
                  lng: place.lng,
                  name: place.name,
                  type: 'attraction',
                })
              }
            >
              <h3 className="font-semibold text-lg mb-2">{place.name}</h3>
              <p className="text-sm text-gray-600">{place.address}</p>
              {place.distance && (
                <p className="text-xs text-gray-500 mt-2">
                  Distance: {(place.distance / 1000).toFixed(2)} km
                </p>
              )}
            </div>
          ))}
        </div>
      </div>


      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            Restaurants ({itinerary.restaurants.length})
          </h2>
          <button
            onClick={() => setShowRestaurants(!showRestaurants)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            {showRestaurants ? 'Hide on Map' : 'Show on Map'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itinerary.restaurants.slice(0, 6).map((restaurant, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                handlePinClick({
                  lat: restaurant.lat,
                  lng: restaurant.lng,
                  name: restaurant.name,
                  type: 'restaurant',
                })
              }
            >
              <h3 className="font-semibold text-lg mb-2">{restaurant.name}</h3>
              <p className="text-sm text-gray-600">{restaurant.address}</p>
              {restaurant.phone && (
                <p className="text-xs text-gray-500 mt-1">📞 {restaurant.phone}</p>
              )}
              {restaurant.url && (
                <a
                  href={restaurant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-1 block"
                >
                  View Details →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

