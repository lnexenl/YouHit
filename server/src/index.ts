import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/activities.js';

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

console.log('🔧 ENV check:', {
  API_CLIENT_ID: process.env.API_CLIENT_ID ? '✅ loaded' : '❌ missing',
  API_CLIENT_SECRET: process.env.API_CLIENT_SECRET ? '✅ loaded' : '❌ missing',
});

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET  /auth/login     - Start OAuth flow`);
  console.log(`   GET  /auth/callback  - OAuth callback`);
  console.log(`   GET  /auth/status    - Check auth status`);
  console.log(`   POST /auth/logout    - Logout`);
  console.log(`   GET  /api/athlete    - Get athlete info`);
  console.log(`   GET  /api/activities - Get activities`);
});