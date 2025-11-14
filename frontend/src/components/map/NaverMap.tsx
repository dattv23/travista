"use client";

import { useEffect, useRef, useState } from "react";

// Pin point
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
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  const [isNaverReady, setIsNaverReady] = useState(false);

  // Poll for Naver API readiness
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (
        window.naver &&
        window.naver.maps &&
        window.naver.maps.Map &&
        window.naver.maps.LatLng &&
        window.naver.maps.Marker &&
        window.naver.maps.Event &&
        window.naver.maps.Polyline
      ) {
        setIsNaverReady(true);
        clearInterval(intervalId);
      }
    }, 100); 
    return () => clearInterval(intervalId);
  }, []); 

  // Initialize the map
  useEffect(() => {
    if (!isNaverReady || !mapElement.current || mapInstanceRef.current) {
      return;
    }

    const initialCenter =
      center || (path.length > 0 ? path[0] : { lat: 37.5665, lng: 126.9780 });
    const location = new window.naver.maps.LatLng(
      initialCenter.lat,
      initialCenter.lng
    );

    const mapOptions = {
      center: location,
      zoom: mapZoom,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    };

    mapInstanceRef.current = new window.naver.maps.Map(
      mapElement.current,
      mapOptions
    );
  }, [isNaverReady, center, path, mapZoom]); // Added missing dependencies

  // Zooms/Pans the map
  useEffect(() => {
    if (!isNaverReady || !mapInstanceRef.current || !center) {
      return;
    }
    mapInstanceRef.current.panTo(
      new window.naver.maps.LatLng(center.lat, center.lng)
    );
    mapInstanceRef.current.setZoom(mapZoom);
  }, [isNaverReady, center, mapZoom]);

  // Update markers and polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isNaverReady || !map) return;

    // Clean old markers and polyline
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Draw new markers
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
        if (onPinClick) {
          onPinClick(point);
        }
        showPanorama(position);
      });

      markersRef.current.push(marker);
    });

    // Draw new polyline
    if (path.length > 1) {
      const naverPath = path.map(
        (point) => new window.naver.maps.LatLng(point.lat, point.lng)
      );
      const polyline = new window.naver.maps.Polyline({
        path: naverPath,
        map: map,
        strokeColor: "rgb(45,111,247)",
        strokeWeight: 6,
        strokeOpacity: 0.9,
      });
      polylineRef.current = polyline;
    }
  }, [isNaverReady, path, onPinClick]);

  const showPanorama = (position: any) => {
    if (!panoramaRef.current || !window.naver) {
      console.error("Panorama container or Naver API not ready.");
      return;
    }

    const panoEl = panoramaRef.current;

    if (panoramaInstanceRef.current) {
      panoramaInstanceRef.current.destroy();
      panoramaInstanceRef.current = null;
    }

    // 1. Create the panorama instance, but keep it invisible
    const panorama = new window.naver.maps.Panorama(panoEl, {
      position: position, 
      visible: false,     
      flightSpot: true,
      zoomControl: true,
    });
    
    // Store the instance
    panoramaInstanceRef.current = panorama;

    // 2. Add an event listener for 'pano_status'
    window.naver.maps.Event.addListener(
      panorama,
      "pano_status",
      function (status: string) {
        if (status === "OK") {
          setIsStreetViewVisible(true);
          panorama.setVisible(true);
        } else {
          console.log("No Street View available for this location.");
          if (panoramaInstanceRef.current) {
            panoramaInstanceRef.current.destroy();
            panoramaInstanceRef.current = null;
          }
        }
      }
    );
  };

  const closeStreetView = () => {
    setIsStreetViewVisible(false);
  };

  useEffect(() => {
    if (!isStreetViewVisible && panoramaInstanceRef.current) {
      panoramaInstanceRef.current.destroy();
      panoramaInstanceRef.current = null;
    }
  }, [isStreetViewVisible]);

  return (
    <div className="w-full h-full relative">
      {/* 1. main container */}
      <div ref={mapElement} className="w-full h-full" />

      {/* 2. The Street View container */}
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
        {/* 3. Close Button for Street View */}
        {isStreetViewVisible && (
          <button
            onClick={closeStreetView}
            className="
              absolute top-5 left-5 z-20 
              p-2.5 bg-white 
              border border-gray-300 rounded-md 
              cursor-pointer font-bold
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