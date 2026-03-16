import { Router, Request, Response } from 'express';
import {
  exchangeCodeForToken,
  getAuthUrl,
  refreshAccessToken,
} from '../utils/activity.js';
import { isAuthenticated, AuthenticatedRequest } from '../middleware/session.js';

const router = Router();

const CLIENT_ID = process.env.API_CLIENT_ID!;
const CLIENT_SECRET = process.env.API_CLIENT_SECRET!;
const REDIRECT_URI = process.env.API_REDIRECT_URI!;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

router.get('/login', (_req: Request, res: Response) => {
  const authUrl = getAuthUrl(CLIENT_ID, REDIRECT_URI);
  res.redirect(authUrl);
});

router.get('/callback', async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error) {
    console.error('Auth error:', error);
    return res.redirect(`${CLIENT_URL}/?error=access_denied`);
  }

  if (!code) {
    return res.redirect(`${CLIENT_URL}/?error=no_code`);
  }

  try {
    const tokenData = await exchangeCodeForToken(
      code as string,
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    req.session.accessToken = tokenData.access_token;
    req.session.refreshToken = tokenData.refresh_token;
    req.session.expiresAt = tokenData.expires_at;
    req.session.athlete = {
      id: tokenData.athlete.id,
      firstname: tokenData.athlete.firstname,
      lastname: tokenData.athlete.lastname,
      profile_medium: tokenData.athlete.profile_medium,
    };

    res.redirect(CLIENT_URL);
  } catch (err) {
    console.error('Token exchange error:', err);
    res.redirect(`${CLIENT_URL}/?error=token_error`);
  }
});

router.get('/status', (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  
  if (isAuthenticated(authReq)) {
    res.json({
      authenticated: true,
      athlete: authReq.session.athlete,
    });
  } else {
    res.json({
      authenticated: false,
      athlete: null,
    });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

export async function ensureValidToken(
  req: AuthenticatedRequest
): Promise<string | null> {
  if (!req.session.accessToken || !req.session.refreshToken) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (req.session.expiresAt! > now + 300) {
    return req.session.accessToken!;
  }

  try {
    const tokenData = await refreshAccessToken(
      req.session.refreshToken!,
      CLIENT_ID,
      CLIENT_SECRET
    );

    req.session.accessToken = tokenData.access_token;
    req.session.refreshToken = tokenData.refresh_token;
    req.session.expiresAt = tokenData.expires_at;

    return tokenData.access_token;
  } catch (err) {
    console.error('Token refresh error:', err);
    return null;
  }
}

export default router;