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
  onPinClick
}) => {

  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);

  const panoramaRef = useRef<HTMLDivElement | null>(null);
  const infoWindowRef = useRef<any | null>(null); 

  const [isStreetViewVisible, setIsStreetViewVisible] = useState(false);
  const markersRef = useRef<any[]>([]);
  const [naver, setNaver] = useState<any>(null); 
  const polylineRef = useRef<any>(null);

  // Wait for the Naver script to be ready
  useEffect(() => {
    if (window.naver) {
      setNaver(window.naver);
    }
  }, []);

  // Initialize the map and InfoWindow (runs only ONCE)
  useEffect(() => {
    if (!naver || !mapElement.current || mapInstanceRef.current) {
      return; 
    }

    const initialCenter = center || (path.length > 0 ? path[0] : { lat: 37.5665, lng: 126.9780 });
    const location = new naver.maps.LatLng(initialCenter.lat, initialCenter.lng);

    // -- Initiate map --
    const mapOptions = {
      center: location,
      zoom: mapZoom,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
      },
    };
    
    // Create the map and store the instance
    mapInstanceRef.current = new naver.maps.Map(mapElement.current, mapOptions);

    // Create a single InfoWindow instance to be reused
    infoWindowRef.current = new naver.maps.InfoWindow({
      content: '', // Content will be set dynamically on click
      backgroundColor: '#fff',
      borderColor: '#007bff',
      borderWidth: 1,
      anchorSize: new naver.maps.Size(10, 10),
      pixelOffset: new naver.maps.Point(0, -15)
    });

  }, [naver]); 

  
  // Zooms/Pans the map
  useEffect(() => {
    if (mapInstanceRef.current && center && naver) {
      mapInstanceRef.current.panTo(new naver.maps.LatLng(center.lat, center.lng));
      mapInstanceRef.current.setZoom(mapZoom);
    }
  }, [center, mapZoom, naver]);


  // Update markers and polyline when 'path' changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const infoWindow = infoWindowRef.current;
    if (!map || !naver || !infoWindow) return;

    // -- Clean old markers and polyline -- 
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // -- Draw new markers --
    path.forEach((point) => {
      const position = new naver.maps.LatLng(point.lat, point.lng);
      const marker = new naver.maps.Marker({
        position: position,
        map: map,
      });

      naver.maps.Event.addListener(marker, 'click', () => {
        if (onPinClick) {
          onPinClick(point);
        }

        const contentString = `
          <div style="padding: 10px; min-width: 150px; text-align: center; font-family: Arial, sans-serif;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px;">${point.name || 'Location'}</h4>
            <button id="street-view-btn" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
              View Street View
            </button>
          </div>
        `;
        
        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);

        naver.maps.Event.once(infoWindow, 'domready', () => {
          const btn = document.getElementById('street-view-btn');
          if (btn) {
            btn.onclick = null; 
            btn.onclick = () => {
              console.log("click street view");
              showPanorama(position);
              infoWindow.close();
            };
          }
        });
      });

      markersRef.current.push(marker);
    });

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
      });
      polylineRef.current = polyline;
    }
  }, [path, naver, onPinClick]); 

  const showPanorama = (position: any) => {
    // Check if panoEl exists before calling the service
    const panoEl = panoramaRef.current;
    if (!panoEl) return;

    naver.maps.Service.getPanoramaByLocation(position, (status: any, panoData: any) => {
      if (status !== naver.maps.Service.Status.OK) {
        alert("No Street View available for this location.");
        return;
      }
      
      const panorama = new naver.maps.Panorama(panoEl, {
        position: panoData.result.latlng,
        panoId: panoData.result.panoId,
        flightSpot: true,
        zoomControl: true,
      });
      
      // Now that the panorama is initialized in the (hidden) div,
      // make the div visible and tell the panorama to show itself.
      setIsStreetViewVisible(true);
      panorama.setVisible(true);
    });
  };

  const closeStreetView = () => {
    setIsStreetViewVisible(false);
    // You might want to explicitly destroy the panorama instance if the API provides a way
    // but simply hiding it is usually fine.
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 1. main container */}
      <div 
        ref={mapElement} 
        style={{ width: '100%', height: '100%' }} 
      />

      {/* 2. The Street View container */}
      <div 
        ref={panoramaRef} 
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          // --- CHANGED ---
          // Use visibility and zIndex instead of display
          // This keeps the element in the DOM for the API to attach to
          visibility: isStreetViewVisible ? 'visible' : 'hidden',
          zIndex: isStreetViewVisible ? 10 : -1, // Show above map or hide behind
          // --- END CHANGED ---
        }}
      >
        {/* 3. Close Button for Street View */}
        {isStreetViewVisible && (
          <button
            onClick={closeStreetView}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              // --- CHANGED ---
              // Make sure zIndex is higher than the panorama container
              zIndex: 20, 
              // --- END CHANGED ---
              padding: '10px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Close Street View
          </button>
        )}
      </div>
    </div>
  );
};

export default NaverMap;