import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, PanelLeft, Download, Map, Activity as ActivityIcon } from 'lucide-react';
import type { Activity } from '@/types/activity';
import { ColorSchemeSelector, ColorSchemeKey } from './ColorSchemeSelector';
import { ActivityTypeSelector } from './ActivityTypeSelector';
import { MapStyleSelector, MapStyleKey } from './MapStyleSelector';
import { DateRangeSelector, DateRange } from './DateRangeSelector';
import type { HeatmapRef } from './Heatmap';

interface StatsPanelProps {
  activities: Activity[];
  allActivities: Activity[];
  isLoading: boolean;
  colorScheme: ColorSchemeKey;
  onColorSchemeChange: (scheme: ColorSchemeKey) => void;
  mapStyle: MapStyleKey;
  onMapStyleChange: (style: MapStyleKey) => void;
  showLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  selectedTypes: string[];
  onSelectedTypesChange: (types: string[]) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  heatmapRef: React.RefObject<HeatmapRef | null>;
}

export function StatsPanel({
  activities,
  allActivities,
  isLoading,
  colorScheme,
  onColorSchemeChange,
  mapStyle,
  onMapStyleChange,
  showLabels,
  onShowLabelsChange,
  dateRange,
  onDateRangeChange,
  selectedTypes,
  onSelectedTypesChange,
  isCollapsed = false,
  onToggleCollapse,
  heatmapRef,
}: StatsPanelProps) {
  const stats = useMemo(() => {
    const total = activities.length;
    const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0);
    const totalElevation = activities.reduce((sum, a) => sum + (a.total_elevation_gain || 0), 0);
    const totalMovingTime = activities.reduce((sum, a) => sum + (a.moving_time || 0), 0);

    const sportCounts: Record<string, number> = {};
    activities.forEach((a) => {
      const sport = a.sport_type || a.type;
      sportCounts[sport] = (sportCounts[sport] || 0) + 1;
    });

    const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      totalDistance,
      totalElevation,
      totalMovingTime,
      topSport: topSport ? topSport[0] : null,
      sportCounts,
    };
  }, [activities]);

  const formatDistance = (meters: number) => {
    if (meters >= 1000000) {
      return `${(meters / 1000000).toFixed(1)}k km`;
    }
    return `${(meters / 1000).toFixed(0)} km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    if (hours >= 100) {
      return `${hours} hrs`;
    }
    const days = Math.floor(hours / 24);
    if (days >= 1) {
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const handleDownload = () => {
    heatmapRef.current?.downloadImage();
  };

  if (isLoading) {
    return (
      <div className="bg-neutral-900/80 backdrop-blur-xl border-r border-neutral-800 p-6 w-84 flex flex-col gap-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-800 rounded-lg" />
          <div className="h-20 bg-neutral-800 rounded-lg" />
          <div className="h-32 bg-neutral-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <div className="bg-neutral-900/80 backdrop-blur-xl border-r border-neutral-800 w-14 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="mt-4 flex-1 flex flex-col items-center gap-3">
          <PanelLeft className="w-5 h-5 text-neutral-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/80 backdrop-blur-xl border-r border-neutral-800 p-5 w-84 flex flex-col gap-5 overflow-y-auto relative">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            YouHit
          </h1>
          <p className="text-neutral-500 text-xs mt-0.5">
            Visualize your activity density
          </p>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-neutral-300">
          <Map className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider font-medium">Map Options</span>
        </div>
        <div className="pl-6 space-y-4">
          <ColorSchemeSelector selected={colorScheme} onChange={onColorSchemeChange} />
          <MapStyleSelector
            selected={mapStyle}
            onChange={onMapStyleChange}
            showLabels={showLabels}
            onShowLabelsChange={onShowLabelsChange}
          />
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700 rounded-lg text-sm text-neutral-300 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Heatmap</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-neutral-300">
          <ActivityIcon className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider font-medium">Activity Filters</span>
        </div>
        <div className="pl-6 space-y-4">
          <DateRangeSelector value={dateRange} onChange={onDateRangeChange} />
          <ActivityTypeSelector
            activities={allActivities}
            selectedTypes={selectedTypes}
            onChange={onSelectedTypesChange}
          />
        </div>
      </div>

      <div className="bg-neutral-800/50 rounded-xl p-3">
        <p className="text-neutral-400 text-xs uppercase tracking-wider mb-0.5">
          Showing Activities
        </p>
        <p className="text-3xl font-bold text-white">
          {stats.total.toLocaleString()}
          {activities.length !== allActivities.length && (
            <span className="text-neutral-500 text-base font-normal ml-1">
              / {allActivities.length.toLocaleString()}
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-neutral-800/50 rounded-xl p-2.5">
          <p className="text-neutral-500 text-xs mb-0.5">Distance</p>
          <p className="text-base font-semibold text-white">
            {formatDistance(stats.totalDistance)}
          </p>
        </div>
        <div className="bg-neutral-800/50 rounded-xl p-2.5">
          <p className="text-neutral-500 text-xs mb-0.5">Elevation</p>
          <p className="text-base font-semibold text-white">
            {(stats.totalElevation / 1000).toFixed(1)}k m
          </p>
        </div>
        <div className="bg-neutral-800/50 rounded-xl p-2.5">
          <p className="text-neutral-500 text-xs mb-0.5">Moving Time</p>
          <p className="text-base font-semibold text-white">
            {formatDuration(stats.totalMovingTime)}
          </p>
        </div>
        <div className="bg-neutral-800/50 rounded-xl p-2.5">
          <p className="text-neutral-500 text-xs mb-0.5">Top Sport</p>
          <p className="text-base font-semibold text-white truncate">
            {stats.topSport || '-'}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-neutral-400 text-xs uppercase tracking-wider mb-2">
          Sport Breakdown
        </h3>
        <div className="space-y-1">
          {Object.entries(stats.sportCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([sport, count]) => (
              <div key={sport} className="flex items-center justify-between">
                <span className="text-neutral-300 text-xs truncate">{sport}</span>
                <span className="text-neutral-500 text-xs tabular-nums">
                  {count.toLocaleString()}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}