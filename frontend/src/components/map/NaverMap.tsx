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
  routePath?: [number, number][]; // Route polyline from mapper API
  mapZoom?: number;
  center?: MapPoint;
  onPinClick?: (point: MapPoint) => void;
}

const NaverMap: React.FC<NaverMapProps> = ({
  path = [],
  routePath,
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

  // --- Draw markers and route ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    
    if (!map || !window.naver) return;

    // Clean old markers and polyline
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);

    // Draw markers
    path.forEach((point, index) => {
      const position = new window.naver.maps.LatLng(point.lat, point.lng);
      
      const isStart = index === 0;
      const isEnd = index === path.length - 1;
      
      // Custom marker with number badge
      const markerContent = `
        <div style="
          background: ${isStart ? '#4CAF50' : isEnd ? '#F44336' : '#2196F3'};
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          text-align: center;
          min-width: 30px;
        ">
          ${index + 1}
        </div>
      `;

      const marker = new window.naver.maps.Marker({
        position: position,
        map: map,
        icon: {
          content: markerContent,
          anchor: new window.naver.maps.Point(15, 15)
        }
      });

      // Click handler for Street View
      window.naver.maps.Event.addListener(marker, "click", () => {
        if (onPinClick) onPinClick(point);
        showPanorama(position);
      });

      // Hover info window with location info
      const locationName = point.name || `Stop ${index + 1}`;
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 150px;">
            <h3 style="margin: 0 0 5px 0; font-weight: bold; font-size: 14px;">${locationName}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">📍 ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">Click for Street View</p>
          </div>
        `
      });

      window.naver.maps.Event.addListener(marker, "mouseover", () => {
        infoWindow.open(map, marker);
      });

      window.naver.maps.Event.addListener(marker, "mouseout", () => {
        infoWindow.close();
      });

      markersRef.current.push(marker);
    });

    // Draw route polyline from API
    if (routePath && routePath.length > 1) {
      const naverPath = routePath.map(coord => 
        new window.naver.maps.LatLng(coord[1], coord[0]) // [lng, lat] -> LatLng(lat, lng)
      );
      
      const polyline = new window.naver.maps.Polyline({
        path: naverPath,
        map: map,
        strokeColor: "#5347AA",
        strokeWeight: 5,
        strokeOpacity: 0.8,
      });
      
      polylineRef.current = polyline;

      // Fit bounds to show entire route
      const bounds = new window.naver.maps.LatLngBounds();
      naverPath.forEach(point => bounds.extend(point));
      map.fitBounds(bounds, { padding: 50 });
    }
  }, [path, routePath, isNaverReady]); 

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