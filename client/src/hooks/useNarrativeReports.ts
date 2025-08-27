import { useQuery } from '@tanstack/react-query';
import type { ApiNarrativeReport } from '@shared/schema';

/**
 * Fetches all narrative reports from the API.
 * @returns A promise that resolves to an array of ApiNarrativeReport objects.
 */
const fetchNarrativeReports = async (): Promise<ApiNarrativeReport[]> => {
  const response = await fetch('/api/narrative-reports');
  if (!response.ok) {
    throw new Error('Failed to fetch narrative reports');
  }
  return response.json();
};

/**
 * Custom hook for fetching narrative report data.
 * Centralizes data fetching logic, caching, and error handling for reports.
 * @returns The result of the useQuery hook for narrative reports.
 */
export const useNarrativeReports = () => {
  return useQuery<ApiNarrativeReport[], Error>({
    queryKey: ['narrativeReports'],
    queryFn: fetchNarrativeReports,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
