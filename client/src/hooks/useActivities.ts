import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllActivities, fetchFullPolylines } from '@/lib/api';
import type { Activity } from '@/types/activity';

export function useActivities(enabled: boolean = true) {
  const [activitiesWithPolylines, setActivitiesWithPolylines] = useState<Activity[]>([]);
  const [isFetchingPolylines, setIsFetchingPolylines] = useState(false);
  const [polylineProgress, setPolylineProgress] = useState({ loaded: 0, total: 0 });

  const { data: activities, isLoading, error, refetch } = useQuery<Activity[]>({
    queryKey: ['activities', 'all'],
    queryFn: () => getAllActivities(),
    enabled,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  const loadPolylines = useCallback(async (activityList: Activity[]) => {
    if (activityList.length === 0) return activityList;

    setIsFetchingPolylines(true);
    setPolylineProgress({ loaded: 0, total: activityList.length });

    try {
      const withPolylines = await fetchFullPolylines(
        activityList,
        (loaded, total) => setPolylineProgress({ loaded, total })
      );
      setActivitiesWithPolylines(withPolylines);
      return withPolylines;
    } finally {
      setIsFetchingPolylines(false);
    }
  }, []);

  useEffect(() => {
    if (activities && activities.length > 0 && activitiesWithPolylines.length === 0) {
      loadPolylines(activities);
    }
  }, [activities, activitiesWithPolylines.length, loadPolylines]);

  const refetchAll = useCallback(async () => {
    setActivitiesWithPolylines([]);
    setPolylineProgress({ loaded: 0, total: 0 });
    return refetch();
  }, [refetch]);

  return {
    activities: activitiesWithPolylines.length > 0 ? activitiesWithPolylines : (activities ?? []),
    isLoading: isLoading || isFetchingPolylines,
    isLoadingPolylines: isFetchingPolylines,
    polylineProgress,
    error,
    refetch: refetchAll,
  };
}