# YouHit - AI Reference Documentation

> Version: 0.0.1 (First Release)
> Last Updated: 2026-03-17

## Project Overview

YouHit is a React application that visualizes athletic activity history as an interactive heatmap on Mapbox. Users authenticate via OAuth (Strava API), and their activities are displayed as path-based heatmaps using deck.gl PathLayer.

### Key URLs
- **Production**: https://youhit.lnex.dev
- **Repository**: https://github.com/lnexenl/YouHit

---

## Architecture

### Backend (server/)

| File | Purpose |
|------|---------|
| `src/index.ts` | Express server for local development (port 3001) |
| `src/worker.ts` | Hono worker for Cloudflare Workers deployment |
| `src/routes/auth.ts` | OAuth routes: `/auth/login`, `/auth/callback`, `/auth/status`, `/auth/logout` |
| `src/routes/activities.ts` | API proxy: `/api/athlete`, `/api/activities`, `/api/activities/:id` |
| `src/utils/activity.ts` | Fetch-based API client for external API calls |

### Frontend (client/)

| Directory/File | Purpose |
|----------------|---------|
| `src/App.tsx` | Main app component with auth state, filter states, and layout |
| `src/components/Heatmap.tsx` | Mapbox + deck.gl PathLayer heatmap with label visibility control |
| `src/components/StatsPanel.tsx` | Sidebar with stats, filters, and user profile |
| `src/components/ColorSchemeSelector.tsx` | 7 color schemes for heatmap |
| `src/components/MapStyleSelector.tsx` | 5 map styles (Dark, Streets, Satellite, Outdoors, Light) |
| `src/components/ActivityTypeSelector.tsx` | Multi-select for sport types |
| `src/components/DateRangeSelector.tsx` | Date range filter |
| `src/components/LoadingOverlay.tsx` | Loading spinner with progress |
| `src/components/LoginButton.tsx` | OAuth login button |
| `src/hooks/useAuth.ts` | Authentication state hook |
| `src/hooks/useActivities.ts` | Activity fetching with full polyline loading |
| `src/lib/api.ts` | Axios API client |
| `src/lib/polyline.ts` | Polyline decoder + density center calculation |
| `src/types/activity.ts` | TypeScript interfaces |

---

## Data Flow

### Activity Fetching

```
1. useActivities hook calls getAllActivities()
2. getAllActivities() paginates through /api/activities (200 per page)
3. After list is loaded, fetchFullPolylines() fetches each activity individually
4. Batches of 5 concurrent requests to avoid rate limits
5. Full polyline (1000-10000+ points) replaces summary_polyline (~100-500 points)
6. Activities stored in React Query cache (staleTime: Infinity)
```

### Filtering Pipeline (App.tsx)

```typescript
filteredActivities = activities
  → filter by activity type (selectedTypes)
  → filter by date range (dateRange)
```

---

## Key Implementation Details

### PathLayer Configuration (Heatmap.tsx)

```typescript
new PathLayer({
  id: 'activity-paths',
  data: paths,
  getPath: (d) => d.path,
  getColor: pathColor,
  getWidth: 2,
  widthMinPixels: 1,
  widthMaxPixels: 4,
  capRounded: true,
  jointRounded: true,
  billboard: false,
  opacity: 0.6,
})
```

### Label Visibility Control

Labels are hidden/shown programmatically by iterating over map layers:

```typescript
const LABEL_LAYER_PATTERNS = [
  'label', 'poi', 'place', 'settlement', 'country', 'state',
  'city', 'town', 'village', 'water-label', 'natural',
  'airport', 'heliport', 'ferry',
];

map.setLayoutProperty(layerId, 'visibility', showLabels ? 'visible' : 'none');
```

Uses `styledata` event to re-apply after style changes.

### Auto-Center Algorithm (polyline.ts)

`calculateWeightedCenter()` finds the densest area by:
1. Dividing coordinates into grid cells (0.01 degree = ~1km)
2. Counting activities per cell
3. Returning center of cell with most activities

### Sidebar Collapse State

- User profile is inside `StatsPanel`, not separate
- Collapsed state shows only avatar
- Expanded state shows full profile with refresh/logout buttons

---

## Environment Variables

### Backend (server/.env)
```
API_CLIENT_ID=your_client_id
API_CLIENT_SECRET=your_client_secret
API_REDIRECT_URI=http://localhost:3001/auth/callback
SESSION_SECRET=random_secret_string
PORT=3001
CLIENT_URL=http://localhost:5173
```

### Frontend (client/.env)
```
VITE_MAPBOX_TOKEN=your_mapbox_token
```

---

## Deployment (Cloudflare Workers)

1. KV namespace bound via CF Dashboard (variable: `SESSION_KV`)
2. Secrets set via CF Dashboard:
   - `API_CLIENT_ID`
   - `API_CLIENT_SECRET`
   - `SESSION_SECRET`
3. Variables set via CF Dashboard:
   - `CLIENT_URL`
   - `API_REDIRECT_URI`

### Commands
```bash
npm run dev        # Local development (Express + Vite)
npm run dev:cf     # Local CF Workers development
npm run deploy     # Deploy to CF Workers
```

---

## Known Constraints

1. **API Rate Limits**: Full polyline fetching uses batches of 5 concurrent requests
2. **No-Labels Styles**: Mapbox doesn't provide no-labels style variants; implemented programmatically
3. **Session Storage**: Sessions stored in CF KV with 7-day TTL
4. **Image Download**: Uses `preserveDrawingBuffer: true` for screenshot functionality

---

## Code Patterns

### Component Props Pattern
- Use interface for props with JSDoc-style comments for complex props
- Callbacks named `onXxxChange` for controlled components
- Boolean props have `show`/`is` prefix for clarity

### State Management
- Local component state with `useState`
- React Query for server state (activities, auth)
- No global state library

### Styling
- Tailwind CSS with neutral/orange color palette
- Dark theme by default (`bg-neutral-950`)
- Glassmorphism effects (`backdrop-blur-xl`, `bg-neutral-900/80`)

---

## Common Tasks

### Add a New Filter
1. Add state in `App.tsx`
2. Add prop to `StatsPanel`
3. Create/update selector component
4. Update `filteredActivities` useMemo

### Add a New API Endpoint
1. Add function in `server/src/utils/activity.ts`
2. Add route in `server/src/routes/activities.ts`
3. Add route in `server/src/worker.ts`
4. Add function in `client/src/lib/api.ts`

### Modify Heatmap Rendering
1. Edit `client/src/components/Heatmap.tsx`
2. PathLayer config in `layers` useMemo
3. Color functions in `ColorSchemeSelector.tsx`

---

## File Reference

### Key Files for Common Modifications

| Task | Files to Modify |
|------|-----------------|
| Add filter | `App.tsx`, `StatsPanel.tsx`, new selector component |
| Change colors | `ColorSchemeSelector.tsx` |
| Change map styles | `MapStyleSelector.tsx` |
| Modify heatmap | `Heatmap.tsx`, `polyline.ts` |
| Add API endpoint | `activity.ts`, `routes/activities.ts`, `worker.ts`, `api.ts` |
| Change auth flow | `routes/auth.ts`, `worker.ts`, `useAuth.ts` |
| Update stats | `StatsPanel.tsx` |

---

## Version History

### 0.0.1 (2026-03-17) - First Release
- OAuth authentication with session management
- Full polyline fetching for high-precision heatmap
- 7 color schemes
- 5 map styles with label visibility toggle
- Activity type filter
- Date range filter
- Auto-center on densest area
- Statistics panel
- Sidebar collapse
- Image download
- Cloudflare Workers deployment