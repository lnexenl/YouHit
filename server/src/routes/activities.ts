import { Router, Response } from 'express';
import { getActivities, getAthlete } from '../utils/activity.js';
import { isAuthenticated, AuthenticatedRequest } from '../middleware/session.js';
import { ensureValidToken } from './auth.js';

const router = Router();

router.get('/athlete', async (req, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  
  if (!isAuthenticated(authReq)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const token = await ensureValidToken(authReq);
    if (!token) {
      return res.status(401).json({ error: 'Token refresh failed' });
    }

    const athlete = await getAthlete(token);
    res.json(athlete);
  } catch (err) {
    console.error('Get athlete error:', err);
    res.status(500).json({ error: 'Failed to fetch athlete' });
  }
});

router.get('/activities', async (req, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  
  if (!isAuthenticated(authReq)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const page = parseInt(req.query.page as string) || 1;
  const perPage = Math.min(parseInt(req.query.per_page as string) || 200, 200);
  const before = req.query.before ? parseInt(req.query.before as string) : undefined;
  const after = req.query.after ? parseInt(req.query.after as string) : undefined;

  try {
    const token = await ensureValidToken(authReq);
    if (!token) {
      return res.status(401).json({ error: 'Token refresh failed' });
    }

    const activities = await getActivities(token, page, perPage, before, after);
    res.json(activities);
  } catch (err) {
    console.error('Get activities error:', err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;