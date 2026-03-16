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

## Architecture

```
youhit/
├── server/           # Express backend
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── routes/
│   │   │   ├── auth.ts       # OAuth endpoints
│   │   │   └── activities.ts # API proxy
│   │   ├── middleware/
│   │   │   └── session.ts    # Session types
│   │   └── utils/
│   │       └── activity.ts   # API client
│   └── .env
│
└── client/           # React frontend
    ├── src/
    │   ├── App.tsx           # Main app component
    │   ├── components/
    │   │   ├── Heatmap.tsx   # Mapbox + deck.gl heatmap
    │   │   ├── StatsPanel.tsx
    │   │   └── ...
    │   ├── hooks/
    │   │   ├── useAuth.ts
    │   │   └── useActivities.ts
    │   ├── lib/
    │   │   ├── api.ts        # API client
    │   │   └── polyline.ts   # Polyline decoder
    │   └── types/
    │       └── activity.ts   # TypeScript types
    └── .env
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Map**: Mapbox GL JS 3, deck.gl 9 (PathLayer)
- **Backend**: Express, TypeScript
- **Auth**: OAuth2 with session management

## Features

- Interactive heatmap visualization of all your activities
- Color scheme selector (7 themes)
- Activity type filter
- Auto-center on your most active area
- Statistics panel with distance, elevation, and time

## License

MIT