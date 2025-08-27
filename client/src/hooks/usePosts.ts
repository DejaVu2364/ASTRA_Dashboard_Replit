import { useQuery } from '@tanstack/react-query';
import type { ApiPost } from '@shared/schema';

/**
 * Fetches all posts from the API.
 * @returns A promise that resolves to an array of ApiPost objects.
 */
const fetchPosts = async (): Promise<ApiPost[]> => {
  const response = await fetch('/api/posts');
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

/**
 * Custom hook for fetching post data.
 * Centralizes data fetching logic, caching, and error handling for posts.
 * @returns The result of the useQuery hook for posts.
 */
export const usePosts = () => {
  return useQuery<ApiPost[], Error>({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1, // Retry once on failure
  });
};
