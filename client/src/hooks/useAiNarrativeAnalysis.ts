import { useQuery, type UseQueryResult, type UseQueryOptions } from '@tanstack/react-query';
import type { NarrativeAnalysis } from '@shared/schema';

/**
 * Fetches AI-generated narrative analysis from the API.
 * @returns A promise that resolves to a NarrativeAnalysis object.
 */
const fetchAiNarrativeAnalysis = async (): Promise<NarrativeAnalysis> => {
  const response = await fetch('/api/ai-narrative-analysis');
  if (!response.ok) {
    throw new Error('Failed to fetch AI narrative analysis');
  }
  return response.json();
};

/**
 * Custom hook for fetching AI-generated narrative analysis.
 * @param options Optional query options to pass to useQuery, such as `enabled`.
 * @returns The result of the useQuery hook for the narrative analysis.
 */
export const useAiNarrativeAnalysis = (options?: Omit<UseQueryOptions<NarrativeAnalysis, Error>, 'queryKey' | 'queryFn'>): UseQueryResult<NarrativeAnalysis, Error> => {
  return useQuery<NarrativeAnalysis, Error>({
    queryKey: ['aiNarrativeAnalysis'],
    queryFn: fetchAiNarrativeAnalysis,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};
