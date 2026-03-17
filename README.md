# YouHit

Visualize your entire activity history as an interactive heatmap.

## Features

- **Interactive Heatmap**: Path-based visualization using deck.gl PathLayer
- **High-Precision Routes**: Full polylines (1000-10000+ points per activity)
- **7 Color Schemes**: Flare, Fire, Ocean, Forest, Purple, Neon, Gold
- **5 Map Styles**: Dark, Streets, Satellite, Outdoors, Light
- **Label Visibility Toggle**: Hide/show map labels
- **Activity Type Filter**: Multi-select by sport type
- **Date Range Filter**: Filter activities by date
- **Auto-Center**: Centers on your most active area
- **Statistics Panel**: Distance, elevation, moving time, sport breakdown
- **Image Download**: Export heatmap as PNG
- **Cloudflare Workers**: Serverless deployment

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/lnexenl/YouHit.git
cd YouHit
npm install
```

### 2. Configure Environment

**Backend (`server/.env`):**
```bash
API_CLIENT_ID=your_client_id
API_CLIENT_SECRET=your_client_secret
API_REDIRECT_URI=http://localhost:3001/auth/callback
SESSION_SECRET=random_secret_string
PORT=3001
CLIENT_URL=http://localhost:5173
```

**Frontend (`client/.env`):**
```bash
VITE_MAPBOX_TOKEN=your_mapbox_token
```

Get API credentials from:
- Strava API: https://www.strava.com/settings/api
- Mapbox: https://account.mapbox.com/access-tokens/

### 3. Run Development Servers
```bash
npm run dev
```

This starts:
- Backend server on http://localhost:3001
- Frontend dev server on http://localhost:5173

---

## Cloudflare Workers Deployment

### Prerequisites
1. Cloudflare account
2. Wrangler CLI (installed via npm)

### 1. Login to Cloudflare
```bash
npm run cf:login
```

### 2. Create KV Namespace for Sessions
```bash
npm run cf:kv:create
```

Copy the returned ID to `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "SESSION_KV"
id = "your-kv-namespace-id"
```

### 3. Set Secrets via CF Dashboard

Go to Workers → Settings → Variables and add:
- `API_CLIENT_ID`
- `API_CLIENT_SECRET`
- `SESSION_SECRET`
- `CLIENT_URL`
- `API_REDIRECT_URI`

### 4. Update OAuth Redirect URI

In your Strava API application settings, set the callback URL to:
```
https://youhit.your-subdomain.workers.dev/auth/callback
```

### 5. Deploy
```bash
npm run deploy
```

### Local CF Development
```bash
npm run dev:cf
```

---

## Architecture

```
youhit/
├── server/
│   └── src/
│       ├── index.ts          # Express server (local dev)
│       ├── worker.ts         # Hono worker (CF Workers)
│       ├── routes/
│       │   ├── auth.ts       # OAuth routes
│       │   └── activities.ts # API proxy
│       └── utils/
│           └── activity.ts   # API client (fetch-based)
│
├── client/
│   └── src/
│       ├── App.tsx           # Main component
│       ├── components/
│       │   ├── Heatmap.tsx
│       │   ├── StatsPanel.tsx
│       │   ├── ColorSchemeSelector.tsx
│       │   ├── MapStyleSelector.tsx
│       │   ├── ActivityTypeSelector.tsx
│       │   ├── DateRangeSelector.tsx
│       │   └── ...
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── useActivities.ts
│       ├── lib/
│       │   ├── api.ts
│       │   └── polyline.ts
│       └── types/
│           └── activity.ts
│
├── wrangler.toml             # CF Workers config
└── AGENTS.md                 # AI reference documentation
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Map**: Mapbox GL JS 3, deck.gl 9 (PathLayer)
- **Backend**: Express (local), Hono (CF Workers)
- **Auth**: OAuth2 with KV-based sessions
- **Deploy**: Cloudflare Workers

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | GET | Redirect to OAuth provider |
| `/auth/callback` | GET | OAuth callback handler |
| `/auth/status` | GET | Check authentication status |
| `/auth/logout` | POST | Clear session |
| `/api/athlete` | GET | Get authenticated athlete |
| `/api/activities` | GET | List activities (paginated) |
| `/api/activities/:id` | GET | Get single activity with full polyline |

## License

MIT