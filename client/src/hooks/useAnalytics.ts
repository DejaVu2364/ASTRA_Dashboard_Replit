import { useQuery } from '@tanstack/react-query';
import type { Analytics } from '@shared/schema';

/**
 * Fetches all analytics data from the API.
 * @returns A promise that resolves to an array of Analytics objects.
 */
const fetchAnalytics = async (): Promise<Analytics[]> => {
  const response = await fetch('/api/analytics');
  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }
  return response.json();
};

/**
 * Custom hook for fetching analytics data.
 * Centralizes data fetching logic, caching, and error handling for analytics.
 * @returns The result of the useQuery hook for analytics.
 */
export const useAnalytics = () => {
  return useQuery<Analytics[], Error>({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
