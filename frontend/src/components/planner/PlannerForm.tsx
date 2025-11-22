'use client';

import { useState, FormEvent } from 'react';
import { usePlanner } from '@/hooks/usePlanner';
import { PlannerRequest, Coordinates } from '@/types/planner';
import { PlannerResult } from './index';

interface PlannerFormProps {
  initialDestination?: Coordinates;
  onSubmit?: (request: PlannerRequest) => void;
}

export default function PlannerForm({ initialDestination, onSubmit }: PlannerFormProps) {
  const { isLoading, error, itinerary, createItinerary, pins } = usePlanner();
  const [formData, setFormData] = useState<PlannerRequest>({
    destination: initialDestination || { lat: 37.5665, lng: 126.9780 },
    startDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
    numberOfDays: 3,
    people: '2 adults',
    budget: 'moderate',
    theme: 'cultural and food',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await createItinerary(formData);
      if (onSubmit) {
        onSubmit(formData);
      }
    } catch (err) {
      // Error is already handled by usePlanner hook
      console.error('Failed to create itinerary:', err);
    }
  };

  const handleInputChange = (
    field: keyof PlannerRequest,
    value: string | number | Coordinates,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (itinerary) {
    return (
      <div className="w-full space-y-6">
        <button
          onClick={() => window.location.reload()}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        >
          Create New Itinerary
        </button>
        <PlannerResult itinerary={itinerary} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Destination (Latitude, Longitude)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={formData.destination.lat}
              onChange={(e) =>
                handleInputChange('destination', {
                  ...formData.destination,
                  lat: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={formData.destination.lng}
              onChange={(e) =>
                handleInputChange('destination', {
                  ...formData.destination,
                  lng: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Number of Days */}
        <div>
          <label className="block text-sm font-medium mb-2">Number of Days</label>
          <input
            type="number"
            min="1"
            max="30"
            value={formData.numberOfDays}
            onChange={(e) =>
              handleInputChange('numberOfDays', parseInt(e.target.value) || 1)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* People */}
        <div>
          <label className="block text-sm font-medium mb-2">People</label>
          <input
            type="text"
            placeholder="e.g., 2 adults, 1 child"
            value={formData.people}
            onChange={(e) => handleInputChange('people', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium mb-2">Budget</label>
          <select
            value={formData.budget}
            onChange={(e) => handleInputChange('budget', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <input
            type="text"
            placeholder="e.g., cultural and food, adventure, relaxation"
            value={formData.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Creating Itinerary...' : 'Generate Itinerary'}
      </button>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Fetching locations and generating itinerary...</p>
        </div>
      )}
    </form>
  );
}

