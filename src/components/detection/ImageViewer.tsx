import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Sliders } from 'lucide-react';
import type { SpillDetection } from '@/types';
import { formatCoordinate } from '@/utils';

interface ImageViewerProps {
  detection?: SpillDetection;
  className?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  detection,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'overlay' | 'split' | 'side-by-side'>('overlay');
  const [maskOpacity, setMaskOpacity] = useState<number>(0.75);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [palette, setPalette] = useState<'sar' | 'oceanic' | 'thermal'>('sar');
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const baseLat = detection?.coordinates?.lat || 18.7421;
  const baseLng = detection?.coordinates?.lng || 67.8214;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setCursorCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setCursorCoords(null);
  };

  // Interpolate geographic coordinates from cursor position (approx 0.1 degree scene box)
  const currentLat = cursorCoords ? baseLat + (0.5 - cursorCoords.y) * 0.12 : baseLat;
  const currentLng = cursorCoords ? baseLng + (cursorCoords.x - 0.5) * 0.15 : baseLng;

  // Render SVG procedural SAR imagery
  const renderSARCanvas = (showOverlay: boolean, opacity: number) => {
    return (
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full object-cover select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radar Speckle Pattern */}
          <filter id="sarSpeckle" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" result="noise" />
            <feColorMatrix
              type="matrix"
              values="
                0.3 0 0 0 0.15
                0 0.3 0 0 0.18
                0 0 0.4 0 0.22
                0 0 0 1 0"
              result="coloredNoise"
            />
          </filter>

          {/* Rough Sea Texture Filter */}
          <filter id="seaWaves" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="turbulence" baseFrequency="0.03 0.08" numOctaves="3" result="waves" />
            <feDisplacementMap in="SourceGraphic" in2="waves" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Slick Damping Mask */}
          <radialGradient id="slickGradient" cx="45%" cy="48%" r="40%">
            <stop offset="0%" stopColor="#040814" stopOpacity="0.96" />
            <stop offset="60%" stopColor="#091124" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#15213b" stopOpacity="0" />
          </radialGradient>

          {/* AI Detection Contour Glow */}
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Sea Surface Backscatter (Rough Water) or Uploaded Satellite Product */}
        {detection?.originalImageUrl ? (
          <image
            href={detection.originalImageUrl}
            x="0"
            y="0"
            width="800"
            height="500"
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <>
            <rect width="800" height="500" fill={palette === 'thermal' ? '#141829' : palette === 'oceanic' ? '#071626' : '#131b2a'} />
            <rect width="800" height="500" filter="url(#sarSpeckle)" opacity={palette === 'thermal' ? 0.35 : 0.65} />

            {/* Bathymetry & Wave Swell bands */}
            <g opacity="0.3" stroke="#38bdf8" strokeWidth="1.5" fill="none">
              <path d="M 0 120 Q 200 90, 400 130 T 800 110" />
              <path d="M 0 240 Q 250 200, 500 250 T 800 230" />
              <path d="M 0 380 Q 220 340, 450 390 T 800 370" />
            </g>

            {/* 2. Oil Slick Anomaly (Capillary Wave Damping Zone) */}
            {/* Irregular oil slick boundary matching Arab Sea incident */}
            <path
              d="M 280 210 
                 C 310 180, 370 170, 430 190 
                 C 500 210, 560 200, 600 240 
                 C 630 270, 610 320, 550 335 
                 C 490 350, 460 380, 400 370 
                 C 330 360, 290 330, 270 290 
                 C 255 255, 260 230, 280 210 Z"
              fill="url(#slickGradient)"
            />

            {/* Secondary Slick Sheen */}
            <path
              d="M 460 280 
                 C 490 270, 540 285, 570 300 
                 C 610 320, 620 345, 590 365 
                 C 560 380, 520 370, 480 355 
                 C 450 340, 440 300, 460 280 Z"
              fill="#020612"
              opacity="0.85"
            />
          </>
        )}

        {/* 3. AI Detection Mask (Neon Cyan Contour + Segmentation Heatmap) */}
        {showOverlay && (
          <g style={{ opacity, transition: 'opacity 0.2s' }}>
            {detection?.maskUrl ? (
              <image
                href={detection.maskUrl}
                x="0"
                y="0"
                width="800"
                height="500"
                preserveAspectRatio="none"
              />
            ) : (
              <>
                {/* Segmentation Mask Fill */}
                <path
                  d="M 280 210 
                     C 310 180, 370 170, 430 190 
                     C 500 210, 560 200, 600 240 
                     C 630 270, 610 320, 550 335 
                     C 490 350, 460 380, 400 370 
                     C 330 360, 290 330, 270 290 
                     C 255 255, 260 230, 280 210 Z"
                  fill="rgba(6, 182, 212, 0.35)"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  filter="url(#cyanGlow)"
                />

                <path
                  d="M 460 280 
                     C 490 270, 540 285, 570 300 
                     C 610 320, 620 345, 590 365 
                     C 560 380, 520 370, 480 355 
                     C 450 340, 440 300, 460 280 Z"
                  fill="rgba(6, 182, 212, 0.45)"
                  stroke="#22d3ee"
                  strokeWidth="2"
                />
              </>
            )}

            {/* Bounding Box Reticle */}
            <rect
              x="250"
              y="160"
              width="390"
              height="230"
              fill="none"
              stroke="rgba(6, 182, 212, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="6, 4"
            />

            {/* Corner brackets */}
            <path d="M 250 180 L 250 160 L 270 160" fill="none" stroke="#06b6d4" strokeWidth="3" />
            <path d="M 640 180 L 640 160 L 620 160" fill="none" stroke="#06b6d4" strokeWidth="3" />
            <path d="M 250 370 L 250 390 L 270 390" fill="none" stroke="#06b6d4" strokeWidth="3" />
            <path d="M 640 370 L 640 390 L 620 390" fill="none" stroke="#06b6d4" strokeWidth="3" />

            {/* AI Annotation Tag */}
            <g transform="translate(260, 150)">
              <rect width="180" height="22" rx="4" fill="#0a0f1e" stroke="#06b6d4" strokeWidth="1" />
              <text x="8" y="15" fill="#06b6d4" fontSize="11" fontFamily="monospace" fontWeight="bold">
                CLASS: OIL SLICK ({detection?.confidence ? `${detection.confidence}%` : '94.2%'})
              </text>
            </g>

            {/* Center crosshair */}
            <g transform="translate(420, 270)">
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#f43f5e" strokeWidth="2" />
              <line x1="0" y1="-12" x2="0" y2="12" stroke="#f43f5e" strokeWidth="2" />
              <circle r="6" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
            </g>
          </g>
        )}

        {/* Coordinate Grid Lines */}
        <g stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3, 3">
          <line x1="200" y1="0" x2="200" y2="500" />
          <line x1="400" y1="0" x2="400" y2="500" />
          <line x1="600" y1="0" x2="600" y2="500" />
          <line x1="0" y1="166" x2="800" y2="166" />
          <line x1="0" y1="333" x2="800" y2="333" />
        </g>
      </svg>
    );
  };

  return (
    <div className={`rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-2xl overflow-hidden flex flex-col transition-colors ${className}`}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1424] transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Display Mode:</span>
          <div className="inline-flex rounded-lg bg-slate-200/80 dark:bg-slate-900 p-0.5 border border-slate-300 dark:border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('overlay')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                viewMode === 'overlay' ? 'bg-cyan-500 text-white dark:text-slate-950 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Overlay Mask
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                viewMode === 'side-by-side' ? 'bg-cyan-500 text-white dark:text-slate-950 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Side-by-Side
            </button>
          </div>
        </div>

        {/* Opacity Slider */}
        {viewMode === 'overlay' && (
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-slate-500 dark:text-slate-400">Mask Opacity:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={maskOpacity}
              onChange={(e) => setMaskOpacity(parseFloat(e.target.value))}
              className="w-24 h-1.5 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="font-mono text-cyan-600 dark:text-cyan-400 w-8 text-right font-semibold">{Math.round(maskOpacity * 100)}%</span>
          </div>
        )}

        {/* Zoom & Palette Tools */}
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded-lg bg-slate-200/80 dark:bg-slate-900 p-0.5 border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/60 dark:hover:bg-slate-800 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.25))}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/60 dark:hover:bg-slate-800 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/60 dark:hover:bg-slate-800 rounded transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="inline-flex rounded-lg bg-slate-200/80 dark:bg-slate-900 p-0.5 border border-slate-300 dark:border-slate-800 text-[11px]">
            {(['sar', 'oceanic', 'thermal'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPalette(p)}
                className={`px-2 py-1 rounded uppercase font-semibold transition ${
                  palette === p ? 'bg-cyan-500 text-white dark:bg-slate-700 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Imagery Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 min-h-[380px] sm:min-h-[460px] bg-[#070b16] overflow-hidden cursor-crosshair flex items-center justify-center"
      >
        <div
          className="w-full h-full flex transition-transform duration-200 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {viewMode === 'overlay' ? (
            <div className="w-full h-full relative">
              {renderSARCanvas(true, maskOpacity)}
            </div>
          ) : (
            <div className="w-full h-full grid grid-cols-2 divide-x divide-slate-800">
              <div className="relative">
                <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-[#0a0f1e]/80 text-[10px] font-mono text-slate-300 border border-slate-800">
                  RAW SAR (SENTINEL-1)
                </div>
                {renderSARCanvas(false, 0)}
              </div>
              <div className="relative">
                <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-cyan-950/80 text-[10px] font-mono text-cyan-300 border border-cyan-800">
                  AI SEGMENTATION (UNET)
                </div>
                {renderSARCanvas(true, 1)}
              </div>
            </div>
          )}
        </div>

        {/* Watermark & Demo Label */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-[#0a0f1e]/85 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>COPERNICUS SENTINEL-1 IW • 10M C-SAR</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-semibold">DEMO DATA</span>
        </div>

        {/* Live Coordinate HUD */}
        <div className="absolute bottom-3 right-3 z-10 bg-[#0a0f1e]/85 backdrop-blur-sm border border-slate-800 px-3 py-1 rounded text-[11px] font-mono text-cyan-400">
          {formatCoordinate(currentLat, 'lat')} • {formatCoordinate(currentLng, 'lng')}
        </div>
      </div>
    </div>
  );
};
