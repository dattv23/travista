import axiosClient from '@/config/axiosClient';
import { PlannerRequest, PlannerResponse } from '@/types/planner';

export const plannerService = {

  async createItinerary(request: PlannerRequest): Promise<PlannerResponse> {
    try {
    
      const response = await axiosClient.post<PlannerResponse>(
        '/api/planner/create-itinerary',
        request,
      );

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create itinerary';
      console.error('Planner API error:', error);
      throw new Error(errorMessage);
    }
  },
};

