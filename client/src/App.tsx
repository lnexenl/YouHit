import { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Heatmap } from '@/components/Heatmap';
import { StatsPanel } from '@/components/StatsPanel';
import { LoginButton } from '@/components/LoginButton';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useAuth } from '@/hooks/useAuth';
import { useActivities } from '@/hooks/useActivities';
import { LogOut, RefreshCw } from 'lucide-react';
import type { ColorSchemeKey } from '@/components/ColorSchemeSelector';

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

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

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
    if (selectedTypes.length === allTypes.length) return activities;
    return activities.filter((a) => {
      const sport = a.sport_type || a.type;
      return selectedTypes.includes(sport);
    });
  }, [activities, selectedTypes, allTypes.length]);

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
          selectedTypes={selectedTypes}
          onSelectedTypesChange={setSelectedTypes}
        />
        
        {athlete && (
          <div className="p-4 border-t border-neutral-800 bg-neutral-900/80">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={athlete.profile_medium}
                alt={`${athlete.firstname} ${athlete.lastname}`}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {athlete.firstname} {athlete.lastname}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                           bg-neutral-800 hover:bg-neutral-700 text-neutral-300 
                           rounded-lg text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                           bg-neutral-800 hover:bg-neutral-700 text-neutral-300 
                           rounded-lg text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        {activitiesLoading && (
          <LoadingOverlay 
            message="Loading your activities..." 
            progress={activities.length}
          />
        )}
        
        {filteredActivities.length > 0 && !activitiesLoading ? (
          <Heatmap activities={filteredActivities} colorScheme={colorScheme} />
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