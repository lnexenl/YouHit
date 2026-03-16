import { useMemo } from 'react';

export const COLOR_SCHEMES = {
  flare: {
    name: 'Flare',
    color: [255, 248, 220, 80],
  },
  fire: {
    name: 'Fire',
    color: [255, 100, 0, 80],
  },
  ocean: {
    name: 'Ocean',
    color: [0, 150, 255, 80],
  },
  forest: {
    name: 'Forest',
    color: [34, 139, 34, 80],
  },
  purple: {
    name: 'Purple',
    color: [138, 43, 226, 80],
  },
  neon: {
    name: 'Neon',
    color: [0, 255, 127, 80],
  },
  gold: {
    name: 'Gold',
    color: [255, 215, 0, 80],
  },
} as const;

export type ColorSchemeKey = keyof typeof COLOR_SCHEMES;

interface ColorSchemeSelectorProps {
  selected: ColorSchemeKey;
  onChange: (scheme: ColorSchemeKey) => void;
}

export function ColorSchemeSelector({ selected, onChange }: ColorSchemeSelectorProps) {
  const schemes = useMemo(() => Object.entries(COLOR_SCHEMES) as [ColorSchemeKey, typeof COLOR_SCHEMES.flare][], []);

  return (
    <div className="space-y-2">
      <label className="text-neutral-400 text-xs uppercase tracking-wider">
        Color Scheme
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        {schemes.map(([key, scheme]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`
              flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs
              transition-all duration-150
              ${selected === key
                ? 'bg-neutral-700 text-white ring-1 ring-neutral-600'
                : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50 hover:text-neutral-300'
              }
            `}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: `rgba(${scheme.color[0]}, ${scheme.color[1]}, ${scheme.color[2]}, 1)` }}
            />
            <span className="truncate">{scheme.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function getPathColor(scheme: ColorSchemeKey): [number, number, number, number] {
  return [...COLOR_SCHEMES[scheme].color] as [number, number, number, number];
}