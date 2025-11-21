import { SearchResponse } from '@/types/location';

const API_BASE_URL = process.env.NEXT_PUBLIC_NODE_API_URL;

export const locationService = {
  async searchPlaces(keyword: string): Promise<SearchResponse> {
    if (!keyword.trim()) {
      return { addresses: [] };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/search/location?keyword=${encodeURIComponent(keyword)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search locations');
      }

      return await response.json();
    } catch (error) {
      console.error('Location search error:', error);
      throw error;
    }
  },
};
