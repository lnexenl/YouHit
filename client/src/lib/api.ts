import axios from 'axios';
import type { Athlete, Activity, AuthStatus } from '@/types/activity';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getAuthStatus(): Promise<AuthStatus> {
  const response = await api.get<AuthStatus>('/auth/status');
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export function getLoginUrl(): string {
  return '/auth/login';
}

export async function getAthlete(): Promise<Athlete> {
  const response = await api.get<Athlete>('/api/athlete');
  return response.data;
}

export interface GetActivitiesParams {
  page?: number;
  perPage?: number;
  before?: number;
  after?: number;
}

export async function getActivities(
  params: GetActivitiesParams = {}
): Promise<Activity[]> {
  const response = await api.get<Activity[]>('/api/activities', {
    params: {
      page: params.page || 1,
      per_page: params.perPage || 200,
      before: params.before,
      after: params.after,
    },
  });
  return response.data;
}

export async function getAllActivities(
  onProgress?: (loaded: number) => void
): Promise<Activity[]> {
  const allActivities: Activity[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const activities = await getActivities({ page, perPage });
    if (activities.length === 0) break;

    allActivities.push(...activities);
    onProgress?.(allActivities.length);

    if (activities.length < perPage) break;
    page++;
  }

  return allActivities;
}

export default api;