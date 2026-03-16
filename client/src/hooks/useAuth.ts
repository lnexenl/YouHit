import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthStatus, logout as apiLogout } from '@/lib/api';
import type { AuthStatus } from '@/types/activity';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<AuthStatus>({
    queryKey: ['auth', 'status'],
    queryFn: getAuthStatus,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isAuthenticated = data?.authenticated ?? false;
  const athlete = data?.athlete ?? null;

  const logout = async () => {
    await apiLogout();
    queryClient.clear();
    window.location.href = '/';
  };

  return {
    isAuthenticated,
    athlete,
    isLoading,
    error,
    logout,
    loginUrl: '/auth/login',
  };
}