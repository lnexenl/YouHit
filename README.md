# YouHit

Visualize your entire activity history as an interactive heatmap.

## Quick Start

### 1. Clone & Install
```bash
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

Get a Mapbox token from https://account.mapbox.com/access-tokens/

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

### 3. Set Secrets
```bash
wrangler secret put API_CLIENT_ID
wrangler secret put API_CLIENT_SECRET
wrangler secret put SESSION_SECRET
```

### 4. Update OAuth Redirect URI

In your API application settings, set the callback URL to:
```
https://youhit.your-subdomain.workers.dev/auth/callback
```

Update `wrangler.toml`:
```toml
[vars]
CLIENT_URL = "https://youhit.your-subdomain.workers.dev"
API_REDIRECT_URI = "https://youhit.your-subdomain.workers.dev/auth/callback"
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
│       └── utils/
│           └── activity.ts   # API client (fetch-based)
│
├── client/
│   └── src/
│       ├── App.tsx
│       ├── components/
│       │   ├── Heatmap.tsx
│       │   └── ...
│       ├── hooks/
│       ├── lib/
│       └── types/
│
└── wrangler.toml             # CF Workers config
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Map**: Mapbox GL JS 3, deck.gl 9 (PathLayer)
- **Backend**: Express (local), Hono (CF Workers)
- **Auth**: OAuth2 with KV-based sessions
- **Deploy**: Cloudflare Workers

## Features

- Interactive heatmap visualization of all your activities
- Color scheme selector (7 themes)
- Activity type filter
- Auto-center on your most active area
- Statistics panel with distance, elevation, and time

## License

MIT