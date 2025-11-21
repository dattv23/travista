import { PlannerRequest, PlannerResponse } from '@/types/planner';

export const plannerService = {
  async createItinerary(request: PlannerRequest): Promise<PlannerResponse> {
    // 1. Setup Timeout (90 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_NODE_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${baseUrl}/api/planner/create-itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        credentials: 'include', 
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse JSON error
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Planner API timed out after 90s');
        throw new Error('Request timed out. The AI is taking too long to respond.');
      }
      
      console.error('Planner API error:', error);
      throw new Error(error.message || 'Failed to create itinerary');
    } finally {
      // Prevent memory leaks
      clearTimeout(timeoutId);
    }
  },
};