'use client';

import { ArrowCircleLeft } from '@mui/icons-material';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { AddModal } from '@/components/ui/addModal';
import PlanCard from '@/components/ui/planCard';
import { useModal } from '@/hooks/useModal';
import { SummaryModal } from '@/components/ui/summaryModal';
import { ReviewSummaryData } from '@/types/review';
import { usePlanner } from '@/hooks/usePlanner';
import {
  AIItineraryResult,
  DayPlan,
  PlannerRequest,
  RouteData,
  TimelineItem,
} from '@/types/planner';
import { MapBounds, MapCenterState, MapPoint } from '@/types/map';
import { mapperService } from '@/services/mapper.service';

interface PlanClientUIProps {
  searchParams: {
    location: string;
    lat?: string;
    lng?: string;
    date: string;
    duration: string;
    people: string;
    budget: string;
    theme: string;
  };
  initialItinerary: MapPoint[];
}

interface RouteSummary {
  distance: string;
  duration: string;
  taxiFare: number;
}

const DynamicNaverMap = dynamic(() => import('@/components/map/NaverMap'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#eee' }} />,
});

const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export default function PlanUI({ searchParams, initialItinerary }: PlanClientUIProps) {
  const { isLoading, error, itinerary: plannerItinerary, pins, createItinerary } = usePlanner();
  const addModal = useModal();
  const summaryModal = useModal();

  const [itinerary, setItinerary] = useState(initialItinerary);
  const [parsedData, setParsedData] = useState<AIItineraryResult | null>(null);
  const [routePath, setRoutePath] = useState<number[][]>([]);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [mapCenterState, setMapCenterState] = useState<MapCenterState | undefined>(undefined);
  const [initialMapBounds, setInitialMapBounds] = useState<MapBounds | undefined>(undefined);
  const [activeSegmentPath, setActiveSegmentPath] = useState<number[][] | undefined>(undefined);
  const [focusBounds, setFocusBounds] = useState<MapBounds | undefined>(undefined);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pendingLocation, setPendingLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [totalDuration, setTotalDuration] = useState<string>('');

  // Prevent double fetching
  const hasInitiatedRef = useRef(false);
  // Track whether we should recalculate route on next itinerary change
  const shouldRecalculateRouteRef = useRef(false);

  // Calculate total itinerary duration
  const calculateTotalDuration = useCallback(() => {
    let totalMinutes = 0;

    // Calculate time from parsed timeline data (activities + travel time between locations)
    if (parsedData) {
      parsedData.days.forEach((day) => {
        day.timeline.forEach((item) => {
          // Add activity duration (time spent at location)
          if (item.duration_minutes) {
            totalMinutes += item.duration_minutes;
          }
        });
      });
    }

    // Add travel time from route summary if available (driving time between locations)
    if (routeSummary?.duration) {
      // Parse duration string like "120 minutes" or "2 hours 30 minutes"
      const durationStr = routeSummary.duration;
      const minutesMatch = durationStr.match(/(\d+)\s*minutes?/i);
      if (minutesMatch) {
        const travelMinutes = parseInt(minutesMatch[1]);
        totalMinutes += travelMinutes;
      } else {
        // Try parsing hours and minutes
        const hoursMatch = durationStr.match(/(\d+)\s*hours?/i);
        const minsMatch = durationStr.match(/(\d+)\s*minutes?/i);
        if (hoursMatch) {
          totalMinutes += parseInt(hoursMatch[1]) * 60;
        }
        if (minsMatch) {
          totalMinutes += parseInt(minsMatch[1]);
        }
      }
    }

    // Format the duration
    if (totalMinutes > 0) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      const locationCount = itinerary.length;

      if (hours > 0) {
        setTotalDuration(
          `Est. ${hours} ${hours === 1 ? 'hour' : 'hours'}${mins > 0 ? ` ${mins} min` : ''} (${locationCount} ${locationCount === 1 ? 'location' : 'locations'})`,
        );
      } else {
        setTotalDuration(
          `Est. ${mins} min (${locationCount} ${locationCount === 1 ? 'location' : 'locations'})`,
        );
      }
    } else {
      // Fallback if calculation fails
      const locationCount = itinerary.length;
      if (routeSummary?.duration) {
        // Just show route duration if we have it
        setTotalDuration(
          `Est. ${routeSummary.duration} (${locationCount} ${locationCount === 1 ? 'location' : 'locations'})`,
        );
      } else {
        setTotalDuration(
          `Est. (${locationCount} ${locationCount === 1 ? 'location' : 'locations'})`,
        );
      }
    }
  }, [parsedData, routeSummary, itinerary.length]);

  // Update total duration when data changes
  useEffect(() => {
    calculateTotalDuration();
  }, [calculateTotalDuration]);

  const generatePlan = useCallback(() => {
    if (!initialItinerary.length || !initialItinerary[0].lat || !initialItinerary[0].lng) {
      console.error('Missing coordinates for itinerary generation');
      return;
    }

    const lat = initialItinerary[0].lat;
    const lng = initialItinerary[0].lng;

    console.log('Triggering AI Planner:', { lat, lng });

    let startDate = searchParams.date;
    if (startDate.includes('/')) {
      const [day, month, year] = startDate.split('/');
      startDate = `${year}-${month}-${day}`;
    }

    const request: PlannerRequest = {
      destination: { lat: lat, lng: lng },
      startDate: startDate,
      numberOfDays: parseInt(searchParams.duration?.match(/(\d+)/)?.[1] || '1'),
      people: searchParams.people,
      budget: searchParams.budget,
      theme: searchParams.theme,
    };

    // console.log('Request: ', request);

    createItinerary(request)
      .then(() => console.log('AI Itinerary Generated Successfully'))
      .catch((err) => console.error('AI Generation Failed:', err));
  }, [initialItinerary, searchParams, createItinerary]);

  useEffect(() => {
    if (!hasInitiatedRef.current) {
      hasInitiatedRef.current = true;
      generatePlan();
    }
  }, [generatePlan]);

  useEffect(() => {
    if (plannerItinerary && plannerItinerary.itinerary) {
      try {
        const result: AIItineraryResult = JSON.parse(plannerItinerary.itinerary);
        const backendRouteData = (plannerItinerary as any).routeData as RouteData | undefined;
        const allReferencePlaces = [
          ...(plannerItinerary.places || []),
          ...(plannerItinerary.restaurants || []),
        ];
        const mapPoints: MapPoint[] = [];

        let finalTimelineData: TimelineItem[] = [];

        result.days.forEach((day) => {
          day.timeline.forEach((item, idx) => {
            const locationItem: TimelineItem = {
              ...item,
              uniqueId: `loc-${day.day_index}-${idx}`,
            };

            let finalLat = locationItem.lat;
            let finalLng = locationItem.lng;
            if (!finalLat || !finalLng) {
              const found = allReferencePlaces.find(
                (p) =>
                  p.name === item.nameEN ||
                  p.name.includes(item.nameEN) ||
                  (item.nameKR && p.name.includes(item.nameKR || '')),
              );
              if (found) {
                finalLat = found.lat;
                finalLng = found.lng;
              }
            }
            locationItem.lat = finalLat || null;
            locationItem.lng = finalLng || null;
            if (finalLat && finalLng) mapPoints.push({ lat: finalLat, lng: finalLng });
            finalTimelineData.push(locationItem);
          });
        });

        let globalRouteIndex = 0;
        const finalEnrichedTimeline: TimelineItem[] = [];

        for (let idx = 0; idx < finalTimelineData.length; idx++) {
          const item = finalTimelineData[idx];
          finalEnrichedTimeline.push(item);

          if (idx < finalTimelineData.length - 1) {
            const nextItem = finalTimelineData[idx + 1];

            const driveStartTime = item.end_time;
            const driveEndTime = nextItem.start_time;

            const durationMins = timeToMinutes(driveEndTime) - timeToMinutes(driveStartTime);

            console.log('Duration: ', durationMins);

            let sectionPath: number[][] | undefined = undefined;
            let driveDistance = '';

            const isValidRouteLeg = item.lat && item.lng && nextItem.lat && nextItem.lng;

            if (isValidRouteLeg) {
              if (
                backendRouteData &&
                backendRouteData.sections &&
                backendRouteData.sections[globalRouteIndex]
              ) {
                const section = backendRouteData.sections[globalRouteIndex];

                driveDistance = section.distanceText;
                if ((section as any).path) {
                  sectionPath = (section as any).path;
                }
              }
              globalRouteIndex++;
            }

            finalEnrichedTimeline.push({
              index: -1,
              nameEN: 'Driving',
              type: 'car',
              start_time: driveStartTime,
              end_time: driveEndTime,
              duration_minutes: durationMins,
              lat: null,
              lng: null,
              note: driveDistance ? `Distance: ${driveDistance}` : 'Estimated travel time',
              uniqueId: `car-${item.uniqueId}`,
              startCoords: { lat: item.lat, lng: item.lng },
              endCoords: { lat: nextItem.lat, lng: nextItem.lng },
              sectionPath: sectionPath,
            } as any);
          }
        }

        let currentDayIndex = -1;
        const finalParsedDays: DayPlan[] = [];

        finalEnrichedTimeline.forEach((item) => {
          const dayIndex = Number(item.uniqueId?.split('-')[1]);

          if (dayIndex !== currentDayIndex) {
            currentDayIndex = dayIndex;
            const originalDay = result.days.find((d: any) => d.day_index === dayIndex);
            if (originalDay) {
              finalParsedDays.push({ ...originalDay, timeline: [] });
            }
          }
          if (finalParsedDays.length > 0) {
            finalParsedDays[finalParsedDays.length - 1].timeline.push(item);
          }
        });

        setParsedData({ days: finalParsedDays });
        setItinerary(mapPoints);

        if (backendRouteData) {
          setRoutePath(backendRouteData.path);
          setRouteSummary(backendRouteData.summary);
        }

        if (
          backendRouteData &&
          backendRouteData.path.length > 0 &&
          typeof window !== 'undefined' &&
          window.naver
        ) {
          const pathLatLngs = backendRouteData.path.map(
            ([lng, lat]) => new window.naver.maps.LatLng(lat, lng),
          );

          const markerLatLngs = mapPoints.map((p) => new window.naver.maps.LatLng(p.lat, p.lng));
          const allPoints = [...pathLatLngs, ...markerLatLngs];

          if (allPoints.length > 0) {
            const bounds = new window.naver.maps.LatLngBounds(allPoints[0], allPoints[0]);
            allPoints.forEach((pt) => bounds.extend(pt));
            setInitialMapBounds({
              latLngBounds: bounds,
              padding: 100,
            });
          }
        }
      } catch (e) {
        console.error('Failed to parse itinerary', e);
      }
    }
  }, [plannerItinerary]);

  const handleRetry = () => {
    console.log('Retrying generation...');
    generatePlan();
  };
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<ReviewSummaryData | null>(null);

  const handleGetSummary = async (locationName: string) => {
    setIsLoadingSummary(true);
    setSummaryData(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/reviews/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationName }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const text = await response.text();
      if (!text) {
        console.warn('Server returned empty response for summary');
        return;
      }

      const data = JSON.parse(text);
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleAddNewStop = async (
    newStop: { name: string; lat: number; lng: number },
    forceAdd: boolean = false,
  ) => {
    if (itinerary.length < 2) {
      // Not enough stops to validate, just add it
      setItinerary([...itinerary, { lat: newStop.lat, lng: newStop.lng }]);
      shouldRecalculateRouteRef.current = true; // Mark that we should recalculate route
      addModal.close();
      setPendingLocation(null);
      setValidationWarning(null);
      setValidationError(null);
      return;
    }

    // If forcing add (Add Anyway), just add it and close
    if (forceAdd && pendingLocation) {
      setItinerary([...itinerary, { lat: pendingLocation.lat, lng: pendingLocation.lng }]);
      shouldRecalculateRouteRef.current = true; // Mark that we should recalculate route
      addModal.close();
      setPendingLocation(null);
      setValidationWarning(null);
      setValidationError(null);
      return;
    }

    setIsValidating(true);
    setValidationWarning(null);
    setValidationError(null);
    setPendingLocation(newStop);

    try {
      // Convert itinerary to "lng,lat" format
      const stopList = itinerary.map((point) => `${point.lng},${point.lat}`);
      const newStopStr = `${newStop.lng},${newStop.lat}`;

      // Insert after the first stop (index 0) as default
      // You can make this configurable later
      const insertAfterIndex = 0;
      const maxDurationHours = 12;

      const validation = await mapperService.validateItineraryDuration({
        stopList,
        newStop: newStopStr,
        insertAfterIndex,
        maxDurationHours,
      });

      if (validation.valid) {
        // Show warning if close to limit (within 1 hour of max) or too far
        const hoursRemaining =
          (validation.maxDurationMinutes - validation.totalDurationMinutes) / 60;
        let warningMsg: string | null = null;

        if (hoursRemaining < 1 && hoursRemaining > 0) {
          warningMsg = `Warning: Adding this location will leave only ${hoursRemaining.toFixed(1)} hours available. Total duration: ${(validation.totalDurationMinutes / 60).toFixed(1)} hours.`;
        } else if (validation.totalDistanceKm > 200) {
          // Warn if total distance exceeds 200km
          warningMsg = `Warning: Total distance is ${validation.totalDistanceKm.toFixed(1)} km, which may be too far for a day trip.`;
        }

        if (warningMsg) {
          // Show warning but don't add yet - wait for user decision
          setValidationWarning(warningMsg);
        } else {
          // No warning, add immediately and close
          setItinerary([...itinerary, { lat: newStop.lat, lng: newStop.lng }]);
          shouldRecalculateRouteRef.current = true; // Mark that we should recalculate route
          setTimeout(() => {
            addModal.close();
            setPendingLocation(null);
            setValidationWarning(null);
          }, 500);
        }
      } else {
        // Show error - exceeds limit, don't allow adding
        const errorMsg =
          validation.message ||
          `Cannot add location: itinerary would exceed ${maxDurationHours} hours.`;
        setValidationError(errorMsg);
        // Don't add the stop and keep modal open so user can see the error
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      setValidationError(error.message || 'Failed to validate location. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleAddAnyway = () => {
    if (pendingLocation) {
      handleAddNewStop(pendingLocation, true);
    }
  };

  const handleCancel = () => {
    setPendingLocation(null);
    setValidationWarning(null);
    setValidationError(null);
  };

  // Recalculate route when itinerary changes
  const recalculateRoute = async (locations: MapPoint[]) => {
    if (locations.length < 2) {
      setRoutePath([]);
      return;
    }

    try {
      // Convert to "lng,lat" format
      const locationStrings = locations.map((point) => `${point.lng},${point.lat}`);

      const routeData = await mapperService.drawRoute({
        locations: locationStrings,
      });

      if (routeData.success && routeData.data) {
        setRoutePath(routeData.data.path);
        setRouteSummary({
          distance: routeData.data.summary.distance,
          duration: routeData.data.summary.duration,
          taxiFare: routeData.data.summary.taxiFare,
        });

        // Update map bounds to include new location
        if (typeof window !== 'undefined' && window.naver && routeData.data.path.length > 0) {
          const pathLatLngs = routeData.data.path.map(
            ([lng, lat]) => new window.naver.maps.LatLng(lat, lng),
          );
          const markerLatLngs = locations.map((p) => new window.naver.maps.LatLng(p.lat, p.lng));
          const allPoints = [...pathLatLngs, ...markerLatLngs];

          if (allPoints.length > 0) {
            const bounds = new window.naver.maps.LatLngBounds(allPoints[0], allPoints[0]);
            allPoints.forEach((pt) => bounds.extend(pt));
            setFocusBounds({
              latLngBounds: bounds,
              padding: 100,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error recalculating route:', error);
      // Don't throw - just log the error, map will still show pins
    }
  };

  // Recalculate route only when user actually adds a new stop
  useEffect(() => {
    // Only recalculate if flag is set and we have at least 2 points
    if (shouldRecalculateRouteRef.current && itinerary.length >= 2) {
      shouldRecalculateRouteRef.current = false; // Reset flag
      recalculateRoute(itinerary);
    }
  }, [itinerary]);

  const handlePlanCardClick = (lat: number, lng: number, name: string) => {
    console.log(name, lat, lng);
    setMapCenterState({ lat, lng, zoom: 20 });
    summaryModal.open();
    if (name) {
      handleGetSummary(name);
    }
  };

  const handleDrivingClick = (sectionPath?: number[][]) => {
    if (!sectionPath || sectionPath.length === 0) {
      console.warn('This driving section has no path');
      setActiveSegmentPath(undefined);
      return;
    }

    setActiveSegmentPath(sectionPath);

    // Auto zoom map to fit the driving segment
    if (typeof window !== 'undefined' && window.naver) {
      const latLngs = sectionPath.map(([lng, lat]) => new window.naver.maps.LatLng(lat, lng));
      if (latLngs.length > 0) {
        const bounds = new window.naver.maps.LatLngBounds(latLngs[0], latLngs[0]);
        latLngs.forEach((p) => bounds.extend(p));
        setFocusBounds({
          latLngBounds: bounds,
          padding: 100,
        });
      }
    }
  };

  return (
    <>
      <section className="flex min-h-screen w-full pt-[92px]">
        {/* left section */}
        <div className="bgb-transparent flex h-screen w-1/3 flex-col px-[18px] shadow-xl">
          <div className="pt-4">
            {/* Title */}
            <div>
              {/* buttons */}
              <div className="mb-4">
                <Link
                  href={''}
                  className="text-primary flex max-w-max items-center justify-center rounded-full p-2 transition hover:bg-[color-mix(in_srgb,var(--color-background),black_10%)] hover:text-[color-mix(in_srgb,var(--color-primary),black_10%)]"
                >
                  <ArrowCircleLeft />
                </Link>
              </div>
              <p className="paragraph-p1-semibold text-dark-text">Your Itinerary</p>
            </div>
            <div className="flex items-start gap-6 pt-2">
              <div className="flex flex-col gap-2">
                <p className="paragraph-p3-medium text-dark-text">{searchParams.theme} itinerary</p>
                <p className="paragraph-p3-medium text-sub-text">Start date: {searchParams.date}</p>
                <p className="paragraph-p3-medium text-sub-text">
                  {totalDuration ||
                    `Est. (${itinerary.length} ${itinerary.length === 1 ? 'location' : 'locations'})`}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="paragraph-p3-medium text-sub-text">{searchParams.people}</p>
                <p className="paragraph-p3-medium text-sub-text">
                  Duration: {searchParams.duration}
                </p>
                <p className="paragraph-p3-medium text-sub-text">Budget: {searchParams.budget}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-between">
              <button></button>
              <div className="paragraph-p3-medium flex gap-5">
                <button className="text-primary border-primary cursor-pointer rounded-[8px] border-2 bg-transparent p-2.5 transition hover:bg-[color-mix(in_srgb,var(--color-background),black_10%)]">
                  Edit plan
                </button>
                <button
                  className="bg-primary text-light-text border-primary cursor-pointer rounded-[8px] border-2 p-2.5 transition hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)]"
                  onClick={addModal.open}
                >
                  Add new stop
                </button>
              </div>
            </div>
          </div>
          <hr className="text-divider m-2.5" />
          {/* Main Content Area */}
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-10">
            {isLoading && (
              <div className="w-full p-4 text-center">
                <p className="text-sub-text">Generating your {searchParams.theme} itinerary...</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg p-4 text-center">
                <p className="mb-3 text-sm text-red-600">Failed to generate plan.</p>
                <p className="mb-3 text-xs text-red-400">
                  {typeof error === 'string' ? error : 'Timeout or Server Error'}
                </p>
                <button
                  onClick={handleRetry}
                  className="bg-primary text-light-text flex w-full cursor-pointer items-center justify-center gap-2 rounded-md py-2 text-sm transition hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)]"
                >
                  Try Again
                </button>
              </div>
            )}

            {!isLoading &&
              !error &&
              parsedData &&
              parsedData.days.map((day, dayIdx) => (
                <div key={`day-${dayIdx}`} className="flex flex-col gap-3">
                  {/* Timeline Items */}
                  {day.timeline.map((item, idx) => (
                    <div
                      key={`timeline-item-${dayIdx}-${idx}`}
                      className="w-full cursor-pointer rounded-lg border border-gray-100 bg-white p-2 shadow-sm transition hover:shadow-md"
                      onClick={() => {
                        if (item.type === 'car') {
                          // 👉 Click vào Driving → highlight đoạn đường
                          handleDrivingClick((item as any).sectionPath);
                        } else {
                          if (item.lat && item.lng) {
                            const searchName = (item as any).nameKR || item.nameEN || '';
                            handlePlanCardClick(item.lat, item.lng, searchName);
                          }
                        }
                      }}
                    >
                      <PlanCard
                        type={item.type === 'car' ? 'car' : 'location'}
                        name={item.nameEN}
                        duration={`${item.start_time} - ${item.end_time}`}
                        estTime={`${item.duration_minutes} mins`}
                        summary={item.note}
                        locationIndex={item.type === 'car' ? undefined : item.index}
                      />
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>

        {/* Map */}
        <div className="relative h-screen w-2/3 bg-gray-400">
          <SummaryModal
            isOpen={summaryModal.isOpen}
            onClose={summaryModal.close}
            isLoading={isLoadingSummary}
            data={summaryData}
          />
          <DynamicNaverMap
            path={itinerary}
            polylinePath={routePath}
            activePolylinePath={activeSegmentPath}
            center={mapCenterState}
            initialBounds={initialMapBounds}
            focusBounds={focusBounds}
          />
        </div>
      </section>

      {addModal.isOpen && (
        <div className="bg-dark-text/20 fixed inset-0 z-50 flex items-center justify-center">
          <AddModal
            isOpen={addModal.isOpen}
            onClose={() => {
              addModal.close();
              setValidationWarning(null);
              setValidationError(null);
              setPendingLocation(null);
            }}
            onConfirm={handleAddNewStop}
            validationWarning={validationWarning}
            validationError={validationError}
            isValidating={isValidating}
            onValidationChange={setValidationWarning}
            onAddAnyway={handleAddAnyway}
            onCancel={handleCancel}
          />
        </div>
      )}
    </>
  );
}
