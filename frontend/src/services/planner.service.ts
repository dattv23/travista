import axiosClient from '@/config/axiosClient';
import { PlannerRequest, PlannerResponse } from '@/types/planner';

export const plannerService = {

  async createItinerary(request: PlannerRequest): Promise<PlannerResponse> {
    try {
    
      const response = await axiosClient.post<PlannerResponse>(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/planner/create-itinerary`,
        request,
        {
          timeout: 9000,
        }
      );

      return response.data;
    } catch (error: any) {
      let errorMessage =
        error.response?.data?.message || error.message || 'Failed to create itinerary';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'The AI took too long to respond. Please try again.';
      }
      console.error('Planner API error:', error);
      throw new Error(errorMessage);
    }
  },
};
