import { MapPoint } from './types';

/**
 * Creates a custom HTML marker content with numbered badge
 */
export const createMarkerContent = (index: number, isStart: boolean, isEnd: boolean): string => {
  const backgroundColor = isStart ? '#4CAF50' : isEnd ? '#F44336' : '#2196F3';
  
  return `
    <div style="
      background: ${backgroundColor};
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
};

/**
 * Creates info window content for marker hover
 */
export const createInfoWindowContent = (point: MapPoint, index: number): string => {
  const locationName = point.name || `Stop ${index + 1}`;
  
  return `
    <div style="padding: 10px; min-width: 150px;">
      <h3 style="margin: 0 0 5px 0; font-weight: bold; font-size: 14px;">${locationName}</h3>
      <p style="margin: 0; font-size: 12px; color: #666;">📍 ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}</p>
      <p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">Click for Street View</p>
    </div>
  `;
};

/**
 * Attaches click event listener to marker for Street View and custom callback
 */
export const attachMarkerClickHandler = (
  marker: any,
  point: MapPoint,
  position: any,
  showPanorama: (position: any) => void,
  onPinClick?: (point: MapPoint) => void
) => {
  window.naver.maps.Event.addListener(marker, "click", () => {
    if (onPinClick) onPinClick(point);
    showPanorama(position);
  });
};

/**
 * Attaches hover events (mouseover/mouseout) to show/hide info window
 */
export const attachMarkerHoverHandlers = (
  marker: any,
  map: any,
  infoWindow: any
) => {
  window.naver.maps.Event.addListener(marker, "mouseover", () => {
    infoWindow.open(map, marker);
  });

  window.naver.maps.Event.addListener(marker, "mouseout", () => {
    infoWindow.close();
  });
};

