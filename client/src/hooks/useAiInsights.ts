import { useQuery } from '@tanstack/react-query';
import type { AIInsight } from '@shared/schema';

/**
 * Fetches AI-generated insights from the API.
 * @returns A promise that resolves to an array of AIInsight objects.
 */
const fetchAiInsights = async (): Promise<AIInsight[]> => {
  const response = await fetch('/api/ai-insights');
  if (!response.ok) {
    // Attempt to parse error from body, otherwise use generic message
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch AI insights');
    } catch {
      throw new Error('Failed to fetch AI insights');
    }
  }
  return response.json();
};

/**
 * Custom hook for fetching AI-generated insights.
 * This hook centralizes the logic for fetching, caching, and handling errors for AI insights.
 * @returns The result of the useQuery hook for AI insights.
 */
export const useAiInsights = () => {
  return useQuery<AIInsight[], Error>({
    queryKey: ['aiInsights'],
    queryFn: fetchAiInsights,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
