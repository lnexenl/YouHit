# Strava Heatmap

Visualize your entire Strava activity history as an interactive heatmap.

## Quick Start

### 1. Clone & Install
```bash
npm install
```

### 2. Configure Environment

**Backend (`server/.env`):**
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your Strava API credentials:
- Get credentials from https://www.strava.com/settings/api
- Set the Authorization Callback Domain to your domain (e.g., `localhost` for development)

**Frontend (`client/.env`):**
```bash
cp client/.env.example client/.env
```

Edit `client/.env` with your Mapbox token:
- Get a token from https://account.mapbox.com/access-tokens/

### 3. Run Development Servers
```bash
npm run dev
```

This starts:
- Backend server on http://localhost:3001
- Frontend dev server on http://localhost:5173

### 4. Connect Strava
1. Open http://localhost:5173
2. Click "Connect with Strava"
3. Authorize the app
4. View your activity heatmap!

## Architecture

```
strava-heatmap/
├── server/           # Express backend
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── routes/
│   │   │   ├── auth.ts       # OAuth endpoints
│   │   │   └── activities.ts # API proxy
│   │   ├── middleware/
│   │   │   └── session.ts    # Session types
│   │   └── utils/
│   │       └── strava.ts     # Strava API client
│   └── .env
│
├── client/           # React frontend
│   ├── src/
│   │   ├── App.tsx           # Main app component
│   │   ├── components/
│   │   │   ├── Heatmap.tsx   # Mapbox + deck.gl heatmap
│   │   │   ├── StatsPanel.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useActivities.ts
│   │   ├── lib/
│   │   │   ├── api.ts        # API client
│   │   │   └── polyline.ts   # Polyline decoder
│   │   └── types/
│   │       └── strava.ts     # TypeScript types
│   └── .env
│
└── skills/
    └── strava-api.md  # Strava API reference
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Map**: Mapbox GL JS 3, deck.gl 9 (HeatmapLayer)
- **Backend**: Express, TypeScript
- **Auth**: Strava OAuth2 with session management

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/login` | Start OAuth flow |
| GET | `/auth/callback` | OAuth callback |
| GET | `/auth/status` | Check auth status |
| POST | `/auth/logout` | Logout |
| GET | `/api/athlete` | Get athlete info |
| GET | `/api/activities` | Get activities |

## License

MIT