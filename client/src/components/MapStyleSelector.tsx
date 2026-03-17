import { Map, Satellite, Sun, Moon, Mountain, Eye, EyeOff } from 'lucide-react';

export type MapStyleKey = 'dark-v11' | 'streets-v12' | 'satellite-v9' | 'outdoors-v12' | 'light-v11';

export const MAP_STYLES: Record<MapStyleKey, { name: string; style: string; icon: typeof Moon }> = {
  'dark-v11': { name: 'Dark', style: 'mapbox://styles/mapbox/dark-v11', icon: Moon },
  'streets-v12': { name: 'Streets', style: 'mapbox://styles/mapbox/streets-v12', icon: Map },
  'satellite-v9': { name: 'Satellite', style: 'mapbox://styles/mapbox/satellite-v9', icon: Satellite },
  'outdoors-v12': { name: 'Outdoors', style: 'mapbox://styles/mapbox/outdoors-v12', icon: Mountain },
  'light-v11': { name: 'Light', style: 'mapbox://styles/mapbox/light-v11', icon: Sun },
};

interface MapStyleSelectorProps {
  selected: MapStyleKey;
  onChange: (style: MapStyleKey) => void;
  showLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
}

export function MapStyleSelector({ selected, onChange, showLabels, onShowLabelsChange }: MapStyleSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-neutral-400 text-xs uppercase tracking-wider">
        Map Style
      </h3>
      <div className="flex gap-1.5">
        {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => {
          const { name, icon: Icon } = MAP_STYLES[key];
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-all ${
                selected === key
                  ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50'
                  : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50 hover:text-neutral-300'
              }`}
              title={name}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{name}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onShowLabelsChange(!showLabels)}
        className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
          showLabels
            ? 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50'
            : 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50'
        }`}
      >
        {showLabels ? (
          <>
            <Eye className="w-3.5 h-3.5" />
            <span>Labels Visible</span>
          </>
        ) : (
          <>
            <EyeOff className="w-3.5 h-3.5" />
            <span>Labels Hidden</span>
          </>
        )}
      </button>
    </div>
  );
}