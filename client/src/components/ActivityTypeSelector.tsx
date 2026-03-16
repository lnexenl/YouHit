import { useMemo } from 'react';
import { Check } from 'lucide-react';
import type { Activity } from '@/types/activity';

const SPORT_LABELS: Record<string, string> = {
  Run: '🏃 Run',
  TrailRun: '🏔️ Trail Run',
  VirtualRun: '🏃‍♂️ Virtual Run',
  Ride: '🚴 Ride',
  MountainBikeRide: '🚵 MTB',
  GravelRide: '🚵‍♂️ Gravel',
  VirtualRide: '🚴‍♂️ Virtual Ride',
  EBikeRide: '🚴 EBike',
  Swim: '🏊 Swim',
  Walk: '🚶 Walk',
  Hike: '🥾 Hike',
  AlpineSki: '⛷️ Alpine Ski',
  BackcountrySki: '🎿 Backcountry',
  NordicSki: '⛷️ Nordic Ski',
  Snowboard: '🏂 Snowboard',
  Rowing: '🚣 Rowing',
  Kayaking: '🛶 Kayaking',
  Canoeing: '🛶 Canoeing',
  Crossfit: '🏋️ Crossfit',
  Yoga: '🧘 Yoga',
  WeightTraining: '🏋️‍♂️ Weights',
};

interface ActivityTypeSelectorProps {
  activities: Activity[];
  selectedTypes: string[];
  onChange: (types: string[]) => void;
}

export function ActivityTypeSelector({
  activities,
  selectedTypes,
  onChange,
}: ActivityTypeSelectorProps) {
  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach((a) => {
      const sport = a.sport_type || a.type;
      counts[sport] = (counts[sport] || 0) + 1;
    });
    return counts;
  }, [activities]);

  const sortedTypes = useMemo(
    () => Object.entries(sportCounts).sort((a, b) => b[1] - a[1]),
    [sportCounts]
  );

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((t) => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };

  const selectAll = () => {
    onChange(Object.keys(sportCounts));
  };

  const clearAll = () => {
    onChange([]);
  };

  const allSelected = selectedTypes.length === Object.keys(sportCounts).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-neutral-400 text-xs uppercase tracking-wider">
          Activity Types
        </label>
        <div className="flex gap-2">
          <button
            onClick={allSelected ? clearAll : selectAll}
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {allSelected ? 'Clear' : 'All'}
          </button>
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
        {sortedTypes.map(([type, count]) => {
          const isSelected = selectedTypes.includes(type);
          const label = SPORT_LABELS[type] || type;

          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`
                w-full flex items-center justify-between px-2 py-1.5 rounded-lg
                transition-all duration-150 text-left
                ${isSelected
                  ? 'bg-orange-500/20 text-white'
                  : 'bg-neutral-800/30 text-neutral-400 hover:bg-neutral-700/30 hover:text-neutral-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`
                    w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                    ${isSelected
                      ? 'bg-orange-500 border-orange-500'
                      : 'border-neutral-600'
                    }
                  `}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs truncate">{label}</span>
              </div>
              <span className="text-xs text-neutral-500 tabular-nums">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}