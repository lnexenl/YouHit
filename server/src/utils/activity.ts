const API_BASE = 'https://www.strava.com/api/v3';
const AUTH_BASE = 'https://www.strava.com';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
    profile_medium: string;
    profile: string;
  };
}

export interface Activity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  map?: {
    summary_polyline: string;
    polyline?: string;
  };
}

export interface Athlete {
  id: number;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  summit: boolean;
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<TokenResponse> {
  console.log('Token exchange request:', {
    client_id: clientId ? `${clientId.substring(0, 3)}...` : 'undefined',
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${AUTH_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Token exchange failed:', response.status, errorBody);
    throw new Error(`Token exchange failed: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<TokenResponse> {
  const response = await fetch(`${AUTH_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Token refresh failed:', response.status, errorBody);
    throw new Error(`Token refresh failed: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

export async function getAthlete(accessToken: string): Promise<Athlete> {
  const response = await fetch(`${API_BASE}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Get athlete failed: ${response.status}`);
  }

  return response.json();
}

export async function getActivities(
  accessToken: string,
  page: number = 1,
  perPage: number = 200,
  before?: number,
  after?: number
): Promise<Activity[]> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (before) params.set('before', before.toString());
  if (after) params.set('after', after.toString());

  const response = await fetch(`${API_BASE}/athlete/activities?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Get activities failed:', response.status, errorBody);
    throw new Error(`Get activities failed: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

export async function getActivity(
  accessToken: string,
  activityId: number
): Promise<Activity & { map?: { polyline?: string; summary_polyline: string } }> {
  const response = await fetch(`${API_BASE}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Get activity ${activityId} failed: ${response.status}`);
  }

  return response.json();
}

export function getAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read,activity:read_all,activity:read',
  });
  return `${AUTH_BASE}/oauth/authorize?${params.toString()}`;
}