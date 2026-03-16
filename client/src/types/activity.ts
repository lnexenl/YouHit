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
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  calories?: number;
  kudos_count?: number;
}

export interface HeatmapPoint {
  position: [number, number];
  weight?: number;
}

export interface AuthStatus {
  authenticated: boolean;
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
    profile_medium: string;
  } | null;
}

export type SportType =
  | 'Run'
  | 'TrailRun'
  | 'VirtualRun'
  | 'Ride'
  | 'MountainBikeRide'
  | 'GravelRide'
  | 'VirtualRide'
  | 'EBikeRide'
  | 'Swim'
  | 'Walk'
  | 'Hike'
  | 'AlpineSki'
  | 'BackcountrySki'
  | 'NordicSki'
  | 'Snowboard'
  | 'Rowing'
  | 'Kayaking';