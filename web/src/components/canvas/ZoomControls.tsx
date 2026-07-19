/**
 * Zoom Controls
 *
 * Provides zoom in/out, fit to screen, and reset view controls for the workflow canvas.
 */

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { useDebounce } from '../../hooks/useDebounce';

export interface ZoomControlsProps {
  /** Minimum zoom level (default: 0.1) */
  minZoom?: number;
  /** Maximum zoom level (default: 2) */
  maxZoom?: number;
  /** Zoom step increment (default: 0.1) */
  zoomStep?: number;
  /** Show mini-map toggle */
  showMiniMap?: boolean;
  /** On mini-map toggle change */
  onToggleMiniMap?: (show: boolean) => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  minZoom = 0.1,
  maxZoom = 2,
  zoomStep = 0.1,
  showMiniMap = false,
  onToggleMiniMap,
}) => {
  const { zoomIn, zoomOut, fitView, setViewport, getViewport } = useReactFlow();
  const [currentZoom, setCurrentZoom] = useState(1);

  // Debounce zoom updates to avoid excessive re-renders
  const debouncedZoom = useDebounce(currentZoom, 100);

  const handleZoomIn = () => {
    zoomIn({ duration: 200 });
    const viewport = getViewport();
    setCurrentZoom(Math.min(viewport.zoom + zoomStep, maxZoom));
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 200 });
    const viewport = getViewport();
    setCurrentZoom(Math.max(viewport.zoom - zoomStep, minZoom));
  };

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 300, maxZoom: 1 });
    setCurrentZoom(1);
  };

  const handleReset = () => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 });
    setCurrentZoom(1);
  };

  const handleToggleMiniMap = () => {
    onToggleMiniMap?.(!showMiniMap);
  };

  // Update current zoom from viewport
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentZoom(getViewport().zoom);
    }, 100);
    return () => clearInterval(interval);
  }, [getViewport]);

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
      {/* Zoom controls */}
      <div className="flex flex-col gap-1 p-2 bg-white/10 rounded-lg shadow-lg border border-white/5">
        <div className='flex flex-row items-center'>
          <button
            onClick={handleZoomIn}
            disabled={debouncedZoom >= maxZoom}
            className="p-2 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Zoom in (Ctrl + +)"
          >
            <ZoomIn className="w-4 h-4 text-gray-100" />
          </button>

          <div className="px-2 py-1 text-center">
            <span className="text-xs font-mono text-orange-500">
              {Math.round(debouncedZoom * 100)}%
            </span>
          </div>

          <button
            onClick={handleZoomOut}
            disabled={debouncedZoom <= minZoom}
            className="p-2 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Zoom out (Ctrl + -)"
          >
            <ZoomOut className="w-4 h-4 text-gray-100" />
          </button>
        </div>

        <div className="border-t border-white/10 my-1" />

        <button
          onClick={handleFitView}
          className="p-2 hover:bg-white/5 rounded transition-colors"
          title="Fit to screen (Ctrl + 0)"
        >
          <Maximize className="w-4 h-4 text-gray-100" />
        </button>

        <button
          onClick={handleReset}
          className="p-2 hover:bg-white/5 rounded transition-colors"
          title="Reset view (Ctrl + R)"
        >
          <RotateCcw className="w-4 h-4 text-gray-100" />
        </button>

        {onToggleMiniMap && (
          <>
            <div className="border-t border-white/10 my-1" />
            <button
              onClick={handleToggleMiniMap}
              className={`p-2 hover:bg-white/5 rounded transition-colors ${showMiniMap ? 'bg-brand-blue' : ''
                }`}
              title="Toggle mini-map (M)"
            >
              <svg
                className="w-4 h-4 text-gray-100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 3v18" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
