import { useQuery } from '@tanstack/react-query';
import type { ApiGeminiReport } from '@shared/schema';

/**
 * Fetches all Gemini reports from the API.
 * @returns A promise that resolves to an array of ApiGeminiReport objects.
 */
const fetchGeminiReports = async (): Promise<ApiGeminiReport[]> => {
  const response = await fetch('/api/gemini-reports');
  if (!response.ok) {
    throw new Error('Failed to fetch Gemini reports');
  }
  return response.json();
};

/**
 * Custom hook for fetching Gemini report data.
 * Centralizes data fetching logic, caching, and error handling for reports.
 * @returns The result of the useQuery hook for Gemini reports.
 */
export const useGeminiReports = () => {
  return useQuery<ApiGeminiReport[], Error>({
    queryKey: ['geminiReports'],
    queryFn: fetchGeminiReports,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
