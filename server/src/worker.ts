import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import {
  exchangeCodeForToken,
  getAuthUrl,
  getAthlete,
  getActivities,
  getActivity,
  refreshAccessToken,
} from './utils/activity'

type Bindings = {
  API_CLIENT_ID: string
  API_CLIENT_SECRET: string
  API_REDIRECT_URI: string
  CLIENT_URL: string
  SESSION_SECRET: string
  SESSION_KV: KVNamespace
  ASSETS: Fetcher
}

type SessionData = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  athlete: {
    id: number
    firstname: string
    lastname: string
    profile_medium: string
  }
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  '*',
  cors({
    origin: (origin, c) => c.env.CLIENT_URL,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// Auth: Login
app.get('/auth/login', (c) => {
  const authUrl = getAuthUrl(c.env.API_CLIENT_ID, c.env.API_REDIRECT_URI)
  return c.redirect(authUrl)
})

// Auth: Callback
app.get('/auth/callback', async (c) => {
  const { code, error } = c.req.query()

  if (error) {
    console.error('Auth error:', error)
    return c.redirect(`${c.env.CLIENT_URL}/?error=access_denied`)
  }

  if (!code) {
    return c.redirect(`${c.env.CLIENT_URL}/?error=no_code`)
  }

  try {
    console.log('OAuth callback - env check:', {
      API_CLIENT_ID: c.env.API_CLIENT_ID ? 'set' : 'undefined',
      API_CLIENT_SECRET: c.env.API_CLIENT_SECRET ? 'set' : 'undefined',
      API_REDIRECT_URI: c.env.API_REDIRECT_URI,
      CLIENT_URL: c.env.CLIENT_URL,
    });

    const tokenData = await exchangeCodeForToken(
      code as string,
      c.env.API_CLIENT_ID,
      c.env.API_CLIENT_SECRET,
      c.env.API_REDIRECT_URI
    )

    const sessionId = crypto.randomUUID()
    const sessionData: SessionData = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_at,
      athlete: {
        id: tokenData.athlete.id,
        firstname: tokenData.athlete.firstname,
        lastname: tokenData.athlete.lastname,
        profile_medium: tokenData.athlete.profile_medium,
      },
    }

    await c.env.SESSION_KV.put(sessionId, JSON.stringify(sessionData), {
      expirationTtl: 60 * 60 * 24 * 7,
    })

    setCookie(c, 'session_id', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return c.redirect(c.env.CLIENT_URL)
  } catch (err) {
    console.error('Token exchange error:', err)
    return c.redirect(`${c.env.CLIENT_URL}/?error=token_error`)
  }
})

// Auth: Status
app.get('/auth/status', async (c) => {
  const session = await getSession(c)
  
  if (!session) {
    return c.json({ authenticated: false, athlete: null })
  }

  return c.json({
    authenticated: true,
    athlete: session.athlete,
  })
})

// Auth: Logout
app.post('/auth/logout', async (c) => {
  const sessionId = getCookie(c, 'session_id')
  
  if (sessionId) {
    await c.env.SESSION_KV.delete(sessionId)
  }
  
  deleteCookie(c, 'session_id')
  return c.json({ success: true })
})

// API: Athlete
app.get('/api/athlete', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Not authenticated' }, 401)

  const token = await ensureValidToken(c, session)
  if (!token) return c.json({ error: 'Token refresh failed' }, 401)

  try {
    const athlete = await getAthlete(token)
    return c.json(athlete)
  } catch (err) {
    console.error('Get athlete error:', err)
    return c.json({ error: 'Failed to fetch athlete' }, 500)
  }
})

// API: Activities
app.get('/api/activities', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Not authenticated' }, 401)

  const token = await ensureValidToken(c, session)
  if (!token) return c.json({ error: 'Token refresh failed' }, 401)

  const page = parseInt(c.req.query('page') || '1')
  const perPage = Math.min(parseInt(c.req.query('per_page') || '200'), 200)
  const before = c.req.query('before') ? parseInt(c.req.query('before') as string) : undefined
  const after = c.req.query('after') ? parseInt(c.req.query('after') as string) : undefined

  try {
    const activities = await getActivities(token, page, perPage, before, after)
    return c.json(activities)
  } catch (err) {
    console.error('Get activities error:', err)
    return c.json({ error: 'Failed to fetch activities' }, 500)
  }
})

// API: Single Activity (with full polyline)
app.get('/api/activities/:id', async (c) => {
  const session = await getSession(c)
  if (!session) return c.json({ error: 'Not authenticated' }, 401)

  const token = await ensureValidToken(c, session)
  if (!token) return c.json({ error: 'Token refresh failed' }, 401)

  const activityId = parseInt(c.req.param('id'))
  if (isNaN(activityId)) {
    return c.json({ error: 'Invalid activity ID' }, 400)
  }

  try {
    const activity = await getActivity(token, activityId)
    return c.json(activity)
  } catch (err) {
    console.error('Get activity error:', err)
    return c.json({ error: 'Failed to fetch activity' }, 500)
  }
})

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Helper: Get session from KV
async function getSession(c: any): Promise<SessionData | null> {
  const sessionId = getCookie(c, 'session_id')
  if (!sessionId) return null

  const sessionStr = await c.env.SESSION_KV.get(sessionId)
  if (!sessionStr) return null

  try {
    return JSON.parse(sessionStr)
  } catch {
    return null
  }
}

// Helper: Ensure valid token (refresh if needed)
async function ensureValidToken(c: any, session: SessionData): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000)

  if (session.expiresAt > now + 300) {
    return session.accessToken
  }

  try {
    const tokenData = await refreshAccessToken(
      session.refreshToken,
      c.env.API_CLIENT_ID,
      c.env.API_CLIENT_SECRET
    )

    session.accessToken = tokenData.access_token
    session.refreshToken = tokenData.refresh_token
    session.expiresAt = tokenData.expires_at

    const sessionId = getCookie(c, 'session_id')!
    await c.env.SESSION_KV.put(sessionId, JSON.stringify(session), {
      expirationTtl: 60 * 60 * 24 * 7,
    })

    return tokenData.access_token
  } catch (err) {
    console.error('Token refresh error:', err)
    return null
  }
}

export default app