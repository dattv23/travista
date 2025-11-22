declare global {
  namespace naver {
    namespace maps {
      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }

      class LatLngBounds {
        constructor(...args: LatLng[]);
        extend(latLng: LatLng): void;
        getCenter(): LatLng;
        getMin(): LatLng;
        getMax(): LatLng;
      }

      interface MapOptions {
        center: LatLng;
        zoom: number;
      }

      class Map {
        constructor(mapDiv: HTMLElement | null, mapOptions: MapOptions);
        setCenter(latLng: LatLng): void;
        setZoom(zoom: number, effect?: boolean): void;
        panTo(latLng: LatLng, options?: any): void;
        fitBounds(bounds: LatLngBounds, padding?: number | { top: number, right: number, bottom: number, left: number }): void;
      }
      
      class Point {
        constructor(x: number, y: number);
      }

      class Size {
        constructor(width: number, height: number);
      }

      class Marker {
        constructor(options: any);
        setMap(map: Map | null): void;
      }
      
      class Polyline {
        constructor(options: any);
        setMap(map: Map | null): void;
        getBounds(): LatLngBounds;
      }
      
      class Panorama {
        constructor(mapDiv: HTMLElement | null, options: any);
        setPosition(position: LatLng): void;
        setVisible(visible: boolean): void;
      }
      
      enum Position {
          TOP_LEFT = 0,
          TOP_CENTER = 1,
          TOP_RIGHT = 2,
          LEFT_CENTER = 3,
          CENTER = 4,
          RIGHT_CENTER = 5,
          BOTTOM_LEFT = 6,
          BOTTOM_CENTER = 7,
          BOTTOM_RIGHT = 8
      }

      namespace Event {
        function addListener(target: any, eventName: string, listener: (...args: any[]) => any): any;
      }

    }

    interface Window {
      naver: naver;
    }
  }
}

export {};