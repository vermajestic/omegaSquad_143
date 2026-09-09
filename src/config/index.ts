export const config = {
  appName: 'Ocean Sentinel',
  appSubtitle: 'AI-Powered Marine Oil Spill Intelligence & Vessel Attribution',
  tagline: 'Detect. Trace. Protect.',
  teamName: 'omegaSquad',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  isDemoMode: import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_API_BASE_URL,
  // Attribution weights (configurable - backend team can adjust)
  attributionWeights: {
    spatialProximity: 0.30,
    temporalCorrelation: 0.25,
    trajectoryConsistency: 0.25,
    aisContinuity: 0.20,
  },
  map: {
    defaultCenter: [18.5, 68.0] as [number, number],
    defaultZoom: 6,
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    tileAttribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
  },

  dateFormat: 'dd MMM yyyy',
  timeFormat: 'HH:mm',
  dateTimeFormat: 'dd MMM yyyy, HH:mm',
};
