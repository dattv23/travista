/**
 * Street View (Panorama) utility functions
 */

export interface StreetViewHandlers {
  showPanorama: (position: any) => void;
  closeStreetView: () => void;
}

/**
 * Creates and shows panorama (Street View) at given position
 */
export const createShowPanorama = (
  panoramaRef: React.MutableRefObject<HTMLDivElement | null>,
  panoramaInstanceRef: React.MutableRefObject<any | null>,
  setIsStreetViewVisible: (visible: boolean) => void
) => {
  return (position: any) => {
    if (!panoramaRef.current || !window.naver) {
      console.error("Panorama container or Naver API not ready.");
      return;
    }

    if (panoramaInstanceRef.current) {
      // Reuse existing panorama instance
      panoramaInstanceRef.current.setPosition(position);
      panoramaInstanceRef.current.setVisible(true);
      setIsStreetViewVisible(true);
    } else {
      // Create new panorama instance
      const panorama = new window.naver.maps.Panorama(panoramaRef.current, {
        position: position,
        visible: true,
        flightSpot: true,
        zoomControl: true,
      });
      
      panoramaInstanceRef.current = panorama;
      setIsStreetViewVisible(true);

      // Handle panorama status
      window.naver.maps.Event.addListener(panorama, "pano_status", function (status: string) {
        if (status !== "OK") {
          console.log("No Street View available.");
          alert("No Street View available here.");
        }
      });
    }
  };
};

/**
 * Closes the Street View
 */
export const createCloseStreetView = (
  panoramaInstanceRef: React.MutableRefObject<any | null>,
  setIsStreetViewVisible: (visible: boolean) => void
) => {
  return () => {
    setIsStreetViewVisible(false);
    if (panoramaInstanceRef.current) {
      panoramaInstanceRef.current.setVisible(false);
    }
  };
};

