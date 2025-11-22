"use client";

import { MapBounds, MapPoint } from "@/types/map";
import { useEffect, useRef, useState } from "react";

interface MapCenterState extends MapPoint {
  zoom?: number;
}

interface NaverMapProps {
  path?: MapPoint[];
  polylinePath?: number[][]; 
  activePolylinePath?: number[][]; 
  mapZoom?: number;
  center?: MapCenterState;
  onPinClick?: (point: MapPoint) => void;
  initialBounds?: MapBounds; 
  focusBounds?: MapBounds;   
}

const NaverMap: React.FC<NaverMapProps> = ({
  path = [],
  polylinePath = [],
  activePolylinePath = null, 
  center,
  mapZoom = 12,
  onPinClick,
  initialBounds,
  focusBounds, 
}) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const panoramaRef = useRef<HTMLDivElement | null>(null);
  const panoramaInstanceRef = useRef<any | null>(null);
  
  const appliedBoundsRef = useRef<string | null>(null);
  
  // We need separate refs for the background (gray) and foreground (blue) polylines
  const mainPolylineRef = useRef<any>(null);
  const activePolylineRef = useRef<any>(null);

  const [isStreetViewVisible, setIsStreetViewVisible] = useState(false);
  const [isNaverReady, setIsNaverReady] = useState(false);
  const markersRef = useRef<any[]>([]);

  // 1. Check Naver API
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

  // 2. Initialize Map
  useEffect(() => {
    if (!isNaverReady || !mapElement.current || mapInstanceRef.current) return;

    const initialCenter = { lat: 37.5665, lng: 126.9780 }; 
    const location = new window.naver.maps.LatLng(initialCenter.lat, initialCenter.lng);

    const mapOptions = {
      center: location,
      zoom: mapZoom,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    };

    mapInstanceRef.current = new window.naver.maps.Map(mapElement.current, mapOptions);
  }, [isNaverReady]);


  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.naver || !initialBounds) return;

    if (!appliedBoundsRef.current && !center?.zoom && !focusBounds) {
        console.log("Auto fitting initial bounds...");
        map.fitBounds(initialBounds.latLngBounds, {
            top: 100, right: 50, bottom: 100, left: 50     
        });
        appliedBoundsRef.current = "initial";
    }
  }, [initialBounds, isNaverReady]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.naver || !focusBounds) return;

    const boundsId = focusBounds.latLngBounds.toString();
    
    console.log("Fitting focus bounds...");
    map.fitBounds(focusBounds.latLngBounds, {
        top: 100, right: 100, bottom: 100, left: 100     
    });
    
  }, [focusBounds]);

  useEffect(() => {
    if (!mapInstanceRef.current || !center || !window.naver) return;

    if (center.zoom) {
        const targetLocation = new window.naver.maps.LatLng(center.lat, center.lng);
        mapInstanceRef.current.morph(targetLocation, center.zoom);
    }
  }, [center]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.naver) return;

    // --- Clean up ---
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (mainPolylineRef.current) {
        mainPolylineRef.current.setMap(null);
        mainPolylineRef.current = null;
    }
    if (activePolylineRef.current) {
        activePolylineRef.current.setMap(null);
        activePolylineRef.current = null;
    }

    // --- Draw Markers ---
    path.forEach((point, index) => {
      const position = new window.naver.maps.LatLng(point.lat, point.lng);
      // const largerIcon = {
      //   url: '/icons/pin.png', 
      //   scaledSize: new window.naver.maps.Size(36, 56),
      //   origin: new window.naver.maps.Point(0, 0),
      //   anchor: new window.naver.maps.Point(18, 56)
      // };
      // const marker = new window.naver.maps.Marker({
      //   position: position,
      //   map: map,
      //   icon: largerIcon,
      //   title: point.name || `Stop ${index + 1}`,
      //   zIndex: 100 
      // });
      const markerContent = `
        <div style="position: relative; width: 36px; height: 56px;">
            <img src="/icons/pin.png" style="width: 100%; height: 100%; object-fit: contain;" alt="pin" />
            <span style="
                position: absolute; 
                top: 6px; /* Điều chỉnh vị trí dọc để số nằm giữa phần đầu to của pin */
                left: 50%; 
                transform: translateX(-50%); 
                color: #2D6FF7; 
                font-weight: bold; 
                font-size: 18px;
                font-family: sans-serif;
                text-shadow: 0px 0px 2px rgba(0,0,0,0.5); /* Thêm bóng để số dễ đọc hơn */
            ">
                ${index + 1}
            </span>
        </div>
      `;

      const marker = new window.naver.maps.Marker({
        position: position,
        map: map,
        title: point.name || `Stop ${index + 1}`,
        zIndex: 100,
        // Sử dụng icon dạng HTML
        icon: {
            content: markerContent,
            size: new window.naver.maps.Size(36, 56),
            anchor: new window.naver.maps.Point(18, 56) // Điểm neo vẫn ở giữa đáy (mũi nhọn)
        }
      });
      window.naver.maps.Event.addListener(marker, "click", () => {
        if (onPinClick) onPinClick(point);
        showPanorama(position);
      });
      markersRef.current.push(marker);
    });

    // --- Draw Polylines ---
    let mainPathLatLngs: naver.maps.LatLng[] = [];
    if (polylinePath.length > 0) {
        mainPathLatLngs = polylinePath.map(p => new window.naver.maps.LatLng(p[1], p[0]));
    } else if (path.length > 1) {
        mainPathLatLngs = path.map((point) => new window.naver.maps.LatLng(point.lat, point.lng));
    }

    if (mainPathLatLngs.length > 0) {
      const isDimmed = activePolylinePath && activePolylinePath.length > 0;
      
      mainPolylineRef.current = new window.naver.maps.Polyline({
        path: mainPathLatLngs,
        map: map,
        strokeColor: isDimmed ? "#999999" : "#2D6FF7", // Gray if dimmed, Blue if normal
        strokeWeight: 6,
        strokeOpacity: isDimmed ? 0.3 : 0.9, // Fade out if dimmed
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        zIndex: 1
      });
    }

    // 2. ACTIVE PATH (The highlighted segment)
    if (activePolylinePath && activePolylinePath.length > 0) {
        const activePathLatLngs = activePolylinePath.map(p => new window.naver.maps.LatLng(p[1], p[0]));
        
        activePolylineRef.current = new window.naver.maps.Polyline({
            path: activePathLatLngs,
            map: map,
            strokeColor: "#2D6FF7", // Highlight Blue
            strokeWeight: 7, // Slightly thicker
            strokeOpacity: 1,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            zIndex: 10 // Draw on top of gray line
        });
    }

  }, [path, polylinePath, activePolylinePath, isNaverReady]);

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
      <div ref={mapElement} className="w-full h-full" />

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
            className="absolute top-5 left-5 z-20 p-2.5 bg-white border border-gray-300 rounded-md cursor-pointer font-bold shadow-md hover:bg-gray-50"
          >
            Close Street View
          </button>
        )}
      </div>
    </div>
  );
};

export default NaverMap;