"use client";

import { useEffect, useRef, useState } from "react";
import { NaverMapProps } from './types';
import { 
  createMarkerContent, 
  createInfoWindowContent, 
  attachMarkerClickHandler, 
  attachMarkerHoverHandlers 
} from './markerUtils';
import { createShowPanorama, createCloseStreetView } from './streetViewUtils';

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

    // Create Street View handler
    const showPanorama = createShowPanorama(panoramaRef, panoramaInstanceRef, setIsStreetViewVisible);

    // Draw markers
    path.forEach((point, index) => {
      const position = new window.naver.maps.LatLng(point.lat, point.lng);
      
      const isStart = index === 0;
      const isEnd = index === path.length - 1;
      
      // Create custom marker
      const markerContent = createMarkerContent(index, isStart, isEnd);

      const marker = new window.naver.maps.Marker({
        position: position,
        map: map,
        icon: {
          content: markerContent,
          anchor: new window.naver.maps.Point(15, 15)
        }
      });

      // click handler for Street View
      attachMarkerClickHandler(marker, point, position, showPanorama, onPinClick);

      //  hover info window
      const infoWindowContent = createInfoWindowContent(point, index);
      const infoWindow = new window.naver.maps.InfoWindow({
        content: infoWindowContent
      });

      attachMarkerHoverHandlers(marker, map, infoWindow);

      markersRef.current.push(marker);
    });

    // Draw route 
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
  }, [path, routePath, isNaverReady, onPinClick]); 

  // Create Street View close handler
  const closeStreetView = createCloseStreetView(panoramaInstanceRef, setIsStreetViewVisible);

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