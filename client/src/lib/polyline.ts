import polyline from '@mapbox/polyline';
import type { HeatmapPoint } from '@/types/activity';

export function decodePolyline(encoded: string): [number, number][] {
  if (!encoded) return [];
  return polyline.decode(encoded) as [number, number][];
}

export function toLngLat(coord: [number, number]): [number, number] {
  return [coord[1], coord[0]];
}

export function activitiesToHeatmapPoints(
  activities: { map?: { summary_polyline: string } }[]
): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];

  for (const activity of activities) {
    const encoded = activity.map?.summary_polyline;
    if (!encoded) continue;

    const coords = decodePolyline(encoded);
    for (const coord of coords) {
      points.push({
        position: toLngLat(coord),
        weight: 1,
      });
    }
  }

  return points;
}

export function calculateBounds(
  activities: { map?: { summary_polyline: string } }[]
): [[number, number], [number, number]] | null {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const activity of activities) {
    const encoded = activity.map?.summary_polyline;
    if (!encoded) continue;

    const coords = decodePolyline(encoded);
    for (const [lat, lng] of coords) {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
  }

  if (minLng === Infinity) return null;

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export function calculateCenter(
  activities: { map?: { summary_polyline: string } }[]
): [number, number] | null {
  const bounds = calculateBounds(activities);
  if (!bounds) return null;

  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

export function findDensestArea(
  activities: { map?: { summary_polyline: string } }[],
  gridSize: number = 0.01
): [number, number] | null {
  if (activities.length === 0) return null;

  const gridCounts: Map<string, number> = new Map();
  const gridCenters: Map<string, [number, number]> = new Map();

  for (const activity of activities) {
    const encoded = activity.map?.summary_polyline;
    if (!encoded) continue;

    const coords = decodePolyline(encoded);
    const seenCells = new Set<string>();

    for (const [lat, lng] of coords) {
      const cellLat = Math.floor(lat / gridSize) * gridSize;
      const cellLng = Math.floor(lng / gridSize) * gridSize;
      const cellKey = `${cellLat},${cellLng}`;

      if (!seenCells.has(cellKey)) {
        seenCells.add(cellKey);
        gridCounts.set(cellKey, (gridCounts.get(cellKey) || 0) + 1);
        
        if (!gridCenters.has(cellKey)) {
          gridCenters.set(cellKey, [cellLng + gridSize / 2, cellLat + gridSize / 2]);
        }
      }
    }
  }

  if (gridCounts.size === 0) return null;

  let maxCount = 0;
  let densestCell: string | null = null;

  for (const [cell, count] of gridCounts) {
    if (count > maxCount) {
      maxCount = count;
      densestCell = cell;
    }
  }

  if (!densestCell) return null;

  return gridCenters.get(densestCell) || null;
}

export function calculateWeightedCenter(
  activities: { map?: { summary_polyline: string } }[]
): [number, number] | null {
  if (activities.length === 0) return null;

  const denseCenter = findDensestArea(activities);
  if (denseCenter) return denseCenter;

  return calculateCenter(activities);
}