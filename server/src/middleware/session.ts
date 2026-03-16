import { Request } from 'express';

declare module 'express-session' {
  interface SessionData {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    athlete: {
      id: number;
      firstname: string;
      lastname: string;
      profile_medium: string;
    };
  }
}

export interface AuthenticatedRequest extends Request {
  session: Request['session'] & {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    athlete?: {
      id: number;
      firstname: string;
      lastname: string;
      profile_medium: string;
    };
  };
}

export function isAuthenticated(req: AuthenticatedRequest): boolean {
  return !!(req.session.accessToken && Date.now() / 1000 < req.session.expiresAt!);
}