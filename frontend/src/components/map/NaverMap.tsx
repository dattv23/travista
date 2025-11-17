"use client";

import { useEffect, useRef, useState } from "react";

// Pin point interface
interface MapPoint {
  lat: number;
  lng: number;
  name?: string;
}

interface NaverMapProps {
  path?: MapPoint[];
  mapZoom?: number;
  center?: MapPoint;
  onPinClick?: (point: MapPoint) => void;
}

const NaverMap: React.FC<NaverMapProps> = ({
  path = [],
  center,
  mapZoom = 15, // Default
  onPinClick,
}) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const panoramaRef = useRef<HTMLDivElement | null>(null);
  const panoramaInstanceRef = useRef<any | null>(null);

  const [isStreetViewVisible, setIsStreetViewVisible] = useState(false);
  const [isNaverReady, setIsNaverReady] = useState(false);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // 1. Poll for Naver API readiness (Check if script is loaded)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const intervalId = setInterval(() => {
      if (window.naver && window.naver.maps) {
        setIsNaverReady(true);
        clearInterval(intervalId);
      }
    }, 100);
    return () => clearInterval(intervalId);
  }, []);

  // --- Initialize map --- 
  useEffect(() => {
    if (!isNaverReady || !mapElement.current) return;

    if (mapInstanceRef.current || mapElement.current.hasChildNodes()) {
      return;
    }

    const initialCenter = center || (path.length > 0 ? path[0] : { lat: 37.5665, lng: 126.9780 });
    const location = new window.naver.maps.LatLng(initialCenter.lat, initialCenter.lng);

    const mapOptions = {
      center: location,
      zoom: mapZoom,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    };

    // Create the Map Instance
    mapInstanceRef.current = new window.naver.maps.Map(mapElement.current, mapOptions);
    
  }, [isNaverReady]); 

  // --- Update map center/zoom ---
  useEffect(() => {
    if (!mapInstanceRef.current || !center || !window.naver) return;
    
    const newCenter = new window.naver.maps.LatLng(center.lat, center.lng);
    mapInstanceRef.current.panTo(newCenter);
    mapInstanceRef.current.setZoom(mapZoom);
  }, [center, mapZoom]);

  // --- Draw markers and paths ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    
    if (!map || !window.naver) return;

    // Clean old markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);

    // Draw markers
    path.forEach((point) => {
      const position = new window.naver.maps.LatLng(point.lat, point.lng);
      
      const largerIcon = {
        url: '/icons/pin.png',
        scaledSize: new window.naver.maps.Size(36, 56),
        origin: new window.naver.maps.Point(0, 0),
        anchor: new window.naver.maps.Point(18, 56)
      };

      const marker = new window.naver.maps.Marker({
        position: position,
        map: map,
        icon: largerIcon 
      });

      window.naver.maps.Event.addListener(marker, "click", () => {
        if (onPinClick) onPinClick(point);
        showPanorama(position);
      });

      markersRef.current.push(marker);
    });

    // Draw polyline
    if (path.length > 1) {
      const naverPath = path.map((point) => new window.naver.maps.LatLng(point.lat, point.lng));
      const polyline = new window.naver.maps.Polyline({
        path: naverPath,
        map: map,
        strokeColor: "rgb(45,111,247)",
        strokeWeight: 6,
        strokeOpacity: 0.9,
      });
      polylineRef.current = polyline;
    }
  }, [path, isNaverReady]); 

  const showPanorama = (position: any) => {
    if (!panoramaRef.current || !window.naver) {
      console.error("Panorama container or Naver API not ready.");
      return;
    }

    if (panoramaInstanceRef.current) { 
      panoramaInstanceRef.current.setPosition(position);
      panoramaInstanceRef.current.setVisible(true);
      setIsStreetViewVisible(true);
    } else {
      const panorama = new window.naver.maps.Panorama(panoramaRef.current, {
        position: position,
        visible: true,
        flightSpot: true,
        zoomControl: true,
      });
      panoramaInstanceRef.current = panorama;
      setIsStreetViewVisible(true);

      window.naver.maps.Event.addListener(panorama, "pano_status", function (status: string) {
            if (status !== "OK") {
                console.log("No Street View available.");
                alert("No Street View available here.");
            }
        });
    }
  };

  const closeStreetView = () => {
    setIsStreetViewVisible(false);
    if (panoramaInstanceRef.current) {
        panoramaInstanceRef.current.setVisible(false);
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* 1. Map Container */}
      <div ref={mapElement} className="w-full h-full" />

      {/* 2. Street View Container */}
      <div
        ref={panoramaRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          visibility: isStreetViewVisible ? "visible" : "hidden",
          zIndex: isStreetViewVisible ? 10 : -1,
        }}
      >
        {isStreetViewVisible && (
          <button
            onClick={closeStreetView}
            className="
              absolute top-5 left-5 z-20 
              p-2.5 bg-white 
              border border-gray-300 rounded-md 
              cursor-pointer font-bold shadow-md
            "
          >
            Close Street View
          </button>
        )}
      </div>
    </div>
  );
};

export default NaverMap;