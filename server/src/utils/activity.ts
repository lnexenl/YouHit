import axios from 'axios';

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

// Exchange authorization code for tokens
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<TokenResponse> {
  const response = await axios.post(`${AUTH_BASE}/oauth/token`, {
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });
  return response.data;
}

// Refresh expired token
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<TokenResponse> {
  const response = await axios.post(`${AUTH_BASE}/oauth/token`, {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  return response.data;
}

// Get authenticated athlete
export async function getAthlete(accessToken: string): Promise<Athlete> {
  const response = await axios.get(`${API_BASE}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

// Get athlete activities
export async function getActivities(
  accessToken: string,
  page: number = 1,
  perPage: number = 200,
  before?: number,
  after?: number
): Promise<Activity[]> {
  const params: Record<string, string | number> = { page, per_page: perPage };
  if (before) params.before = before;
  if (after) params.after = after;

  const response = await axios.get(`${API_BASE}/athlete/activities`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params,
  });
  return response.data;
}

// Generate authorization URL
export function getAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read,activity:read_all,activity:read',
  });
  return `${AUTH_BASE}/oauth/authorize?${params.toString()}`;
}