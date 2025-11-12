"use client";

import { useEffect, useRef } from "react";

// Pin point
interface MapPoint {
  lat: number;
  lng: number;
}

interface NaverMapProps {
  mapLat?: number;
  mapLng?: number;
  mapZoom?: number;
  path?: MapPoint[];
}

const NaverMap: React.FC<NaverMapProps> = ({
  mapLat = 37.3595704, // Default value
  mapLng = 127.105399, // Default value
  mapZoom = 10,        // Default value
  path = [],
}) => {

  const mapElement = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    if (!mapElement.current || !window.naver) return;

    const { naver } = window;

    const centerLat = path.length > 0 ? path[0].lat : mapLat;
    const centerLng = path.length > 0 ? path[0].lng : mapLng;
    const location = new naver.maps.LatLng(centerLat, centerLng);

    // -- Initiate map --
    const mapOptions = {
      center: location,
      zoom: mapZoom,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
      },
    };

    const map = new naver.maps.Map(mapElement.current, mapOptions);

    // -- Clean old markers and polyline -- 
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // -- Draw new markers --
    path.forEach((point) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(point.lat, point.lng),
        map: map,
      });
      markersRef.current.push(marker);
    })

    // -- Draw new polyline --
    if (path.length > 1) {
      const naverPath = path.map(
        (point) => new naver.maps.LatLng(point.lat, point.lng)
      );

      const polyline = new naver.maps.Polyline({
        path: naverPath,
        map: map,
        strokeColor: '#5347AA',
        strokeWeight: 6,
        strokeOpacity: 0.9,
      })
      polylineRef.current = polyline
    }

  }, [mapLat, mapLng, mapZoom, path]);

  return(
    <div 
      ref={mapElement} 
      style={{ width: '100%', height: '100%' }} 
    />
  );
};

export default NaverMap;
