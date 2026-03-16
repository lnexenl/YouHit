import { useQuery } from '@tanstack/react-query';
import { getAllActivities } from '@/lib/api';
import type { Activity } from '@/types/activity';

export function useActivities(enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery<Activity[]>({
    queryKey: ['activities', 'all'],
    queryFn: () => getAllActivities(),
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  return {
    activities: data ?? [],
    isLoading,
    error,
    refetch,
  };
}