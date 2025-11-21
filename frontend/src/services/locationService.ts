import axiosClient from '@/config/axiosClient';
import { SearchResponse } from '@/types/location';

export const locationService = {
  async searchPlaces(keyword: string): Promise<SearchResponse> {
    if (!keyword.trim()) {
      return { addresses: [] };
    }

    try {
      const url = `/api/search/location?keyword=${encodeURIComponent(keyword.trim())}`;

      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log('🔍 Searching locations:', url);
      }

      const response = await axiosClient.get<SearchResponse>(url);
      return response as unknown as SearchResponse;
    } catch (error: any) {
      const fullURL = `${error.config?.baseURL || ''}${error.config?.url || ''}`;

      console.error('❌ Location search error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL,
        isNetworkError: !error.response,
      });

      if (!error.response) {
        const networkErrorMessage =
          error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED'
            ? `Cannot connect to server at ${fullURL}. Please check if the backend server is running.`
            : error.message ||
              'Network error - please check your connection and ensure the backend server is running.';

        throw new Error(networkErrorMessage);
      }

      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        `Server error: ${error.response?.status} ${error.response?.statusText}` ||
        'Failed to search locations';

      throw new Error(errorMessage);
    }
  },
};
