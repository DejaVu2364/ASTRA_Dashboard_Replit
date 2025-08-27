import { useQuery } from '@tanstack/react-query';
import type { ApiComment } from '@shared/schema';

/**
 * Fetches all comments from the API.
 * @returns A promise that resolves to an array of ApiComment objects.
 */
const fetchComments = async (): Promise<ApiComment[]> => {
  const response = await fetch('/api/comments');
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }
  return response.json();
};

/**
 * Custom hook for fetching comment data.
 * Centralizes data fetching logic, caching, and error handling for comments.
 * @returns The result of the useQuery hook for comments.
 */
export const useComments = () => {
  return useQuery<ApiComment[], Error>({
    queryKey: ['comments'],
    queryFn: fetchComments,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
