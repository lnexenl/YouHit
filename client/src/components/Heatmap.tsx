import { useMemo } from 'react';
import { Map, useControl } from 'react-map-gl';
import { MapboxOverlay, MapboxOverlayProps } from '@deck.gl/mapbox';
import { PathLayer } from '@deck.gl/layers';
import 'mapbox-gl/dist/mapbox-gl.css';

import type { Activity } from '@/types/activity';
import { decodePolyline, calculateWeightedCenter } from '@/lib/polyline';
import { getPathColor, ColorSchemeKey } from './ColorSchemeSelector';
import type { MapStyleKey } from './MapStyleSelector';

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

interface HeatmapProps {
  activities: Activity[];
  colorScheme: ColorSchemeKey;
  mapStyle: MapStyleKey;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const getStyleUrl = (key: MapStyleKey): string => {
  const styles: Record<MapStyleKey, string> = {
    'dark-v11': 'mapbox://styles/mapbox/dark-v11',
    'streets-v12': 'mapbox://styles/mapbox/streets-v12',
    'satellite-v9': 'mapbox://styles/mapbox/satellite-v9',
    'outdoors-v12': 'mapbox://styles/mapbox/outdoors-v12',
    'light-v11': 'mapbox://styles/mapbox/light-v11',
  };
  return styles[key];
};

export function Heatmap({ activities, colorScheme, mapStyle }: HeatmapProps) {
  const paths = useMemo(() => {
    return activities
      .filter((a) => a.map?.summary_polyline)
      .map((activity, index) => {
        const coords = decodePolyline(activity.map!.summary_polyline);
        const path = coords.map(([lat, lng]) => [lng, lat]);
        return {
          path,
          count: 1,
          index,
        };
      })
      .filter((p) => p.path.length > 1);
  }, [activities]);

  const center = useMemo(() => calculateWeightedCenter(activities), [activities]);

  const pathColor = useMemo(() => getPathColor(colorScheme), [colorScheme]);

  const layers = useMemo(
    () => [
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
        pickable: false,
        miterLimit: 2,
      }),
    ],
    [paths, pathColor]
  );

  const initialViewState = useMemo(() => {
    if (center) {
      return {
        longitude: center[0],
        latitude: center[1],
        zoom: 11,
        pitch: 0,
        bearing: 0,
      };
    }
    return {
      longitude: -98.5795,
      latitude: 39.8283,
      zoom: 3,
      pitch: 0,
      bearing: 0,
    };
  }, [center]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-900 text-neutral-400">
        <p>Mapbox token required. Set VITE_MAPBOX_TOKEN in .env</p>
      </div>
    );
  }

  return (
    <Map
      initialViewState={initialViewState}
      mapStyle={getStyleUrl(mapStyle)}
      mapboxAccessToken={MAPBOX_TOKEN}
      attributionControl={false}
    >
      <DeckGLOverlay layers={layers} interleaved={true} />
    </Map>
  );
}