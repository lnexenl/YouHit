import { useQuery } from '@tanstack/react-query';
import { getAllActivities } from '@/lib/api';
import type { Activity } from '@/types/activity';

export function useActivities(enabled: boolean = true) {
  const { data: activities, isLoading, error, refetch } = useQuery<Activity[]>({
    queryKey: ['activities', 'all'],
    queryFn: () => getAllActivities(),
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  return {
    activities: activities ?? [],
    isLoading,
    isLoadingPolylines: false,
    polylineProgress: { loaded: 0, total: 0 },
    error,
    refetch,
  };
}