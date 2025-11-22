'use client';

import { useMemo } from 'react';
import NaverMap from '@/components/map/NaverMap';
import { MapPin } from '@/types/planner';

interface PlannerMapProps {
  pins: MapPin[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPinClick?: (pin: MapPin) => void;
}

/**
 * PlannerMap Component
 * 
 * Displays planner locations as pins on a map with street view support.
 * Uses the existing NaverMap component with custom pins.
 * 
 * Features:
 * - Shows all planner locations as pins
 * - Click on pin to view street view
 * - Connects pins with polyline
 */
export default function PlannerMap({
  pins,
  center,
  zoom = 15,
  onPinClick,
}: PlannerMapProps) {
  // Convert pins to MapPoint format for NaverMap
  const mapPath = useMemo(() => {
    return pins.map((pin) => ({
      lat: pin.lat,
      lng: pin.lng,
      name: pin.name,
    }));
  }, [pins]);

  // Calculate center from pins if not provided
  const mapCenter = useMemo(() => {
    if (center) return center;
    if (pins.length === 0) return { lat: 37.5665, lng: 126.9780 }; // Default: Seoul

    // Calculate average center
    const sumLat = pins.reduce((sum, pin) => sum + pin.lat, 0);
    const sumLng = pins.reduce((sum, pin) => sum + pin.lng, 0);
    return {
      lat: sumLat / pins.length,
      lng: sumLng / pins.length,
    };
  }, [pins, center]);

  const handlePinClick = (point: { lat: number; lng: number; name?: string }) => {
    // Find the original pin to pass type information
    const originalPin = pins.find(
      (pin) => pin.lat === point.lat && pin.lng === point.lng,
    );

    if (originalPin && onPinClick) {
      onPinClick(originalPin);
    }
  };

  return (
    <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden border border-gray-200">
      <NaverMap
        path={mapPath}
        center={mapCenter}
        mapZoom={zoom}
        onPinClick={handlePinClick}
      />
    </div>
  );
}

