import React, { useState, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import type { Incident, VesselCandidate, VesselTrack } from '@/types';
import { SpillMarker } from './SpillMarker';
import { VesselMarker } from './VesselMarker';
import { VesselTrackLine } from './VesselTrackLine';
import { DetectionZone } from './DetectionZone';
import { MapLegend } from './MapLegend';
import { MapControls, type MapLayerState, type BasemapMode } from './MapControls';
import { DriftSimulationLayer } from './DriftSimulationLayer';
import { useAppContext } from '@/contexts/AppContext';

interface MapContainerProps {
  incidents?: Incident[];
  selectedIncident?: Incident | null;
  onSelectIncident?: (incident: Incident) => void;
  vessels?: VesselCandidate[];
  selectedVessel?: VesselCandidate | null;
  onSelectVessel?: (vessel: VesselCandidate) => void;
  activeTrack?: VesselTrack | null;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showLegend?: boolean;
  showControls?: boolean;
  className?: string;
}

// Controller component to smoothly fly to new coordinates
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);

  return null;
};

export const MapContainer: React.FC<MapContainerProps> = ({
  incidents = [],
  selectedIncident,
  onSelectIncident,
  vessels = [],
  selectedVessel,
  onSelectVessel,
  activeTrack,
  center = [18.7421, 67.8214],
  zoom = 6,
  height = '560px',
  showLegend = true,
  showControls = true,
  className = '',
}) => {
  const { theme } = useAppContext();
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState<number>(zoom);
  const [layers, setLayers] = useState<MapLayerState>({
    showSpills: true,
    showVessels: true,
    showTracks: true,
    showZones: true,
    showDriftSimulation: true,
  });
  const [basemapMode, setBasemapMode] = useState<BasemapMode>('satellite');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // When selected incident changes, focus map onto it
  useEffect(() => {
    if (selectedIncident?.coordinates) {
      setMapCenter([selectedIncident.coordinates.lat, selectedIncident.coordinates.lng]);
      setMapZoom(8);
    }
  }, [selectedIncident]);

  const handleToggleLayer = (key: keyof MapLayerState) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRecenter = () => {
    setMapCenter([18.7421, 67.8214]); // Center of Arabian Sea
    setMapZoom(6);
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg border border-slate-200 dark:border-[#1e293b] bg-slate-100 dark:bg-[#080c14] shadow-xs dark:shadow-none transition-all ${
        isFullscreen ? 'fixed inset-0 z-[2000] !h-screen !rounded-none' : ''
      } ${className}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      <LeafletMapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: '#080c14' }}
      >
        <MapViewController center={mapCenter} zoom={mapZoom} />

        {/* Clean, unwatermarked Esri Basemaps with no API key requirement */}
        {basemapMode === 'satellite' && (
          <>
            <TileLayer
              key="esri-satellite"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
            <TileLayer
              key="esri-satellite-labels"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </>
        )}

        {basemapMode === 'dark' && (
          <>
            <TileLayer
              key="esri-dark"
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
            <TileLayer
              key="esri-dark-labels"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
          </>
        )}

        {basemapMode === 'ocean' && (
          <>
            <TileLayer
              key="esri-ocean"
              attribution='Tiles &copy; Esri, GEBCO, NOAA, National Geographic, DeLorme'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={13}
            />
            <TileLayer
              key="esri-ocean-labels"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
              maxZoom={13}
            />
          </>
        )}


        {/* Detection Zones (SAR slick boundaries) */}
        {layers.showZones && incidents.map(inc => (
          <DetectionZone
            key={`zone-${inc.id}`}
            incident={inc}
            color={inc.id === selectedIncident?.id ? '#22d3ee' : '#ef4444'}
          />
        ))}

        {/* Vessel Track Polyline */}
        {layers.showTracks && activeTrack && (
          <VesselTrackLine
            track={activeTrack}
            vesselName={selectedVessel?.name || 'MV Ocean Star'}
            color="#06b6d4"
          />
        )}

        {/* Oil Spill Incident Markers */}
        {layers.showSpills && incidents.map(inc => (
          <SpillMarker
            key={`spill-${inc.id}`}
            incident={inc}
            isSelected={selectedIncident?.id === inc.id}
            onSelect={onSelectIncident}
          />
        ))}

        {/* Vessel Markers */}
        {layers.showVessels && vessels.map((vessel, idx) => {
          // Compute a realistic position near incident for demo or use track point
          const vesselLat = (selectedIncident?.coordinates?.lat || 18.7421) + (idx === 0 ? -0.007 : (idx * 0.08 - 0.2));
          const vesselLng = (selectedIncident?.coordinates?.lng || 67.8214) + (idx === 0 ? -0.011 : (idx * 0.09 - 0.25));

          return (
            <VesselMarker
              key={`vessel-${vessel.id}`}
              vessel={vessel}
              rank={idx + 1}
              position={{ lat: vesselLat, lng: vesselLng }}
              heading={idx === 0 ? 45 : 110 + idx * 30}
              isSelected={selectedVessel?.id === vessel.id}
              onSelect={onSelectVessel}
            />
          );
        })}

        {/* Drift Simulation Layers */}
        {layers.showDriftSimulation && incidents.map(inc => (
          <DriftSimulationLayer key={`drift-${inc.id}`} incident={inc} />
        ))}
      </LeafletMapContainer>

      {/* Floating Controls */}
      {showControls && (
        <MapControls
          layers={layers}
          onToggleLayer={handleToggleLayer}
          onRecenter={handleRecenter}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          basemapMode={basemapMode}
          onChangeBasemap={setBasemapMode}
        />

      )}

      {/* Floating Legend */}
      {showLegend && <MapLegend />}

      {/* Map Live Coordinate HUD */}
      <div className="absolute top-4 left-4 z-[1000] hidden sm:flex items-center gap-3 bg-[#111827]/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-200">LIVE FEED</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">Region: <strong className="text-slate-200">Arabian Sea</strong></span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">Sensor: <strong className="text-cyan-400">Sentinel-1 C-SAR</strong></span>
      </div>
    </div>
  );
};
