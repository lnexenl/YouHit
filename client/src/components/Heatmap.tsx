import { useMemo, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Map, useControl, MapRef } from 'react-map-gl';
import { MapboxOverlay, MapboxOverlayProps } from '@deck.gl/mapbox';
import { PathLayer } from '@deck.gl/layers';
import 'mapbox-gl/dist/mapbox-gl.css';

import type { Activity } from '@/types/activity';
import { decodePolyline, calculateWeightedCenter } from '@/lib/polyline';
import { getPathColor, ColorSchemeKey } from './ColorSchemeSelector';
import type { MapStyleKey } from './MapStyleSelector';
import { getStyleUrl } from './MapStyleSelector';

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export interface HeatmapRef {
  downloadImage: () => void;
}

interface HeatmapProps {
  activities: Activity[];
  colorScheme: ColorSchemeKey;
  mapStyle: MapStyleKey;
  showLabels: boolean;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const Heatmap = forwardRef<HeatmapRef, HeatmapProps>(function Heatmap(
  { activities, colorScheme, mapStyle, showLabels },
  ref
) {
  const mapRef = useRef<MapRef>(null);

  const downloadImage = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      const canvas = map.getCanvas();
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `youhit-heatmap-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataURL;
      link.click();
    }
  }, []);

  useImperativeHandle(ref, () => ({
    downloadImage,
  }));

  const paths = useMemo(() => {
    return activities
      .filter((a) => a.map?.summary_polyline)
      .map((activity, index) => {
        const encoded = activity.map?.polyline || activity.map!.summary_polyline;
        const coords = decodePolyline(encoded);
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
      ref={mapRef}
      initialViewState={initialViewState}
      mapStyle={getStyleUrl(mapStyle, showLabels)}
      mapboxAccessToken={MAPBOX_TOKEN}
      attributionControl={false}
      preserveDrawingBuffer={true}
    >
      <DeckGLOverlay layers={layers} interleaved={true} />
    </Map>
  );
});