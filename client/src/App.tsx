import { useState, useMemo, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Heatmap, HeatmapRef } from '@/components/Heatmap';
import { StatsPanel } from '@/components/StatsPanel';
import { LoginButton } from '@/components/LoginButton';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useAuth } from '@/hooks/useAuth';
import { useActivities } from '@/hooks/useActivities';
import type { ColorSchemeKey } from '@/components/ColorSchemeSelector';
import type { MapStyleKey } from '@/components/MapStyleSelector';
import type { DateRange } from '@/components/DateRangeSelector';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isAuthenticated, athlete, isLoading: authLoading, logout } = useAuth();
  const { activities, isLoading: activitiesLoading, refetch } = useActivities(isAuthenticated);

  const [colorScheme, setColorScheme] = useState<ColorSchemeKey>('flare');
  const [mapStyle, setMapStyle] = useState<MapStyleKey>('dark-v11');
  const [showLabels, setShowLabels] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const heatmapRef = useRef<HeatmapRef>(null);

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    activities.forEach((a) => {
      const sport = a.sport_type || a.type;
      if (sport) types.add(sport);
    });
    return Array.from(types);
  }, [activities]);

  useMemo(() => {
    if (selectedTypes.length === 0 && allTypes.length > 0) {
      setSelectedTypes(allTypes);
    }
  }, [allTypes, selectedTypes.length]);

  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Filter by activity type
    if (selectedTypes.length !== allTypes.length) {
      filtered = filtered.filter((a) => {
        const sport = a.sport_type || a.type;
        return selectedTypes.includes(sport);
      });
    }

    // Filter by date range
    if (dateRange.startDate || dateRange.endDate) {
      filtered = filtered.filter((a) => {
        if (!a.start_date) return false;
        const activityDate = new Date(a.start_date);
        if (dateRange.startDate && activityDate < new Date(dateRange.startDate)) {
          return false;
        }
        if (dateRange.endDate && activityDate > new Date(dateRange.endDate + 'T23:59:59')) {
          return false;
        }
        return true;
      });
    }

    return filtered;
  }, [activities, selectedTypes, allTypes.length, dateRange]);

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-neutral-950 flex items-center justify-center">
        <LoadingOverlay message="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-neutral-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 via-neutral-950 to-neutral-950" />
        
        <div className="relative z-10 text-center space-y-8 max-w-md px-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-white tracking-tight">
              YouHit
            </h1>
            <p className="text-neutral-400 text-lg">
              Visualize your entire activity history as an interactive heatmap
            </p>
          </div>

          <LoginButton />

          <p className="text-neutral-600 text-sm">
            Your data stays yours. We only read your public activities.
          </p>
        </div>

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-neutral-950">
      <div className="flex flex-col">
        <StatsPanel
          activities={filteredActivities}
          allActivities={activities}
          isLoading={activitiesLoading}
          colorScheme={colorScheme}
          onColorSchemeChange={setColorScheme}
          mapStyle={mapStyle}
          onMapStyleChange={setMapStyle}
          showLabels={showLabels}
          onShowLabelsChange={setShowLabels}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedTypes={selectedTypes}
          onSelectedTypesChange={setSelectedTypes}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          heatmapRef={heatmapRef}
          athlete={athlete}
          onRefresh={refetch}
          onLogout={logout}
        />
      </div>

      <div className="flex-1 relative">
        {activitiesLoading && (
          <LoadingOverlay message="Loading your activities..." />
        )}
        
        {filteredActivities.length > 0 && !activitiesLoading ? (
          <Heatmap
            ref={heatmapRef}
            activities={filteredActivities}
            colorScheme={colorScheme}
            mapStyle={mapStyle}
            showLabels={showLabels}
          />
        ) : !activitiesLoading ? (
          <div className="h-full flex items-center justify-center text-neutral-500">
            <p>No activities found with location data</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;