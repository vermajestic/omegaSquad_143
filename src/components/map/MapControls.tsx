import React from 'react';
import { Eye, EyeOff, Compass, Maximize2, Minimize2, Navigation, Layers } from 'lucide-react';

export type BasemapMode = 'satellite' | 'dark' | 'ocean';

export interface MapLayerState {
  showSpills: boolean;
  showVessels: boolean;
  showTracks: boolean;
  showZones: boolean;
  showDriftSimulation: boolean;
}

interface MapControlsProps {
  layers: MapLayerState;
  onToggleLayer: (key: keyof MapLayerState) => void;
  onRecenter: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  basemapMode?: BasemapMode;
  onChangeBasemap?: (mode: BasemapMode) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  layers,
  onToggleLayer,
  onRecenter,
  isFullscreen = false,
  onToggleFullscreen,
  basemapMode = 'satellite',
  onChangeBasemap,
}) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {/* Basemap Style Selector */}
      {onChangeBasemap && (
        <div className="bg-white/95 dark:bg-[#0d1320]/95 backdrop-blur-md border border-slate-200 dark:border-[#1e293b] rounded-lg p-1.5 shadow-sm dark:shadow-none flex flex-col gap-1 text-xs text-slate-700 dark:text-slate-300 min-w-[140px] transition-colors duration-150">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-1 pb-1 border-b border-slate-100 dark:border-[#1e293b] mb-0.5 flex items-center justify-between font-mono">
            <span>Basemap</span>
            <Layers className="w-3 h-3 text-cyan-500" />
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => onChangeBasemap('satellite')}
              className={`px-1.5 py-1 rounded text-[10px] font-bold uppercase transition-colors text-center cursor-pointer ${
                basemapMode === 'satellite'
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Esri World Imagery (Satellite)"
            >
              Sat
            </button>
            <button
              onClick={() => onChangeBasemap('dark')}
              className={`px-1.5 py-1 rounded text-[10px] font-bold uppercase transition-colors text-center cursor-pointer ${
                basemapMode === 'dark'
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Esri Dark Canvas"
            >
              Dark
            </button>
            <button
              onClick={() => onChangeBasemap('ocean')}
              className={`px-1.5 py-1 rounded text-[10px] font-bold uppercase transition-colors text-center cursor-pointer ${
                basemapMode === 'ocean'
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Esri Ocean Base"
            >
              Sea
            </button>
          </div>
        </div>
      )}

      {/* Recenter / Focus Controls */}
      <div className="bg-white/95 dark:bg-[#0d1320]/95 backdrop-blur-md border border-slate-200 dark:border-[#1e293b] rounded-lg p-1.5 shadow-sm dark:shadow-none flex flex-col gap-1 transition-colors duration-150">
        <button
          onClick={onRecenter}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded transition-colors flex items-center justify-center group relative"
          title="Recenter Map on Arabian Sea"
        >
          <Compass className="w-4 h-4" />
          <span className="sr-only">Recenter Arabian Sea</span>
        </button>

        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded transition-colors flex items-center justify-center"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Layer Visibility Toggles */}
      <div className="bg-white/95 dark:bg-[#0d1320]/95 backdrop-blur-md border border-slate-200 dark:border-[#1e293b] rounded-lg p-2 shadow-sm dark:shadow-none flex flex-col gap-1 text-xs text-slate-700 dark:text-slate-300 min-w-[140px] transition-colors duration-150">
        <div className="text-[10px] uppercase font-bold text-slate-400 px-1 pb-1 border-b border-slate-100 dark:border-[#1e293b] mb-1 flex items-center justify-between font-mono">
          <span>Layers</span>
          <Navigation className="w-3 h-3 text-sky-500" />
        </div>

        <button
          onClick={() => onToggleLayer('showSpills')}
          className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors duration-150 ${
            layers.showSpills 
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium' 
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          <span>Oil Spills</span>
          {layers.showSpills ? <Eye className="w-3.5 h-3.5 text-rose-500" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => onToggleLayer('showVessels')}
          className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors duration-150 ${
            layers.showVessels 
              ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-medium' 
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          <span>AIS Vessels</span>
          {layers.showVessels ? <Eye className="w-3.5 h-3.5 text-sky-500" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => onToggleLayer('showTracks')}
          className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors duration-150 ${
            layers.showTracks 
              ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-medium' 
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          <span>Tracks & CPA</span>
          {layers.showTracks ? <Eye className="w-3.5 h-3.5 text-sky-500" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => onToggleLayer('showZones')}
          className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors duration-150 ${
            layers.showZones 
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium' 
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          <span>SAR Zones</span>
          {layers.showZones ? <Eye className="w-3.5 h-3.5 text-amber-500" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => onToggleLayer('showDriftSimulation')}
          className={`flex items-center justify-between px-2 py-1 rounded text-left transition-colors duration-150 ${
            layers.showDriftSimulation 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium' 
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
          }`}
        >
          <span>Drift Sim</span>
          {layers.showDriftSimulation ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
