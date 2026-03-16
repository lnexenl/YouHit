import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  progress?: number;
}

export function LoadingOverlay({ message = 'Loading...', progress }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-950/90 backdrop-blur-sm">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
        <div>
          <p className="text-white font-medium">{message}</p>
          {progress !== undefined && (
            <p className="text-neutral-400 text-sm mt-1">{progress} activities loaded</p>
          )}
        </div>
      </div>
    </div>
  );
}