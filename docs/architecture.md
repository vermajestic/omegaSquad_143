# Ocean Sentinel — System Architecture

This document provides a technical overview of the **Ocean Sentinel** satellite-driven maritime surveillance and oil spill attribution system.

---

## 1. High-Level Architecture

```
+-----------------------------------------------------------------------------+
|                                Frontend                                     |
|           React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons        |
|  - Real-time Leaflet Map (Satellite / Dark / Nautical Basemap modes)        |
|  - Dynamic Base64 Mask Overlay with Opacity Controls                        |
|  - Hindcast / Forecast Drift Vector Visualization                           |
|  - Suspect Vessel Matrix & Multi-Pillar Attribution Panel                   |
|  - SAR GeoTIFF / PNG Upload and Live Detection Dashboard                    |
+-------------------------------------+---------------------------------------+
                                      | HTTP REST / JSON
                                      v
+-----------------------------------------------------------------------------+
|                             Backend API Gateway                             |
|                           FastAPI + Uvicorn (Python 3.10+)                  |
|  - /api/v1/detection/upload       : SAR Image Segmentation & Metric Extraction|
|  - /api/v1/status                 : Model & Backend Health Status           |
|  - /api/v1/attribution/calculate  : Hindcast Drift & Vessel Intersect Engine|
+---------------------+-------------------------------+-----------------------+
                      |                               |
                      v                               v
+-----------------------------+     +-----------------------------------------+
|     AI / ML Pipeline        |     |       Maritime Physics Engine           |
|  ResNet-34 U-Net (PyTorch)  |     |  - Ocean Surface Current Advection      |
|  - Input: 1-ch SAR Radar VV |     |  - 10m Wind Drift Factor (3% Rule)      |
|  - Output: Binary Slick Mask|     |  - Fay's Gravity-Inertia Spreading      |
|  - Polygonization & Area (km²)|   |  - Reverse Hindcast Trajectory Cone     |
+-----------------------------+     +--------------------+--------------------+
                                                         |
                                                         v
                                    +-----------------------------------------+
                                    |     Vessel Attribution Engine           |
                                    |  4-Pillar Suspect Scoring:              |
                                    |  1. Spatio-Temporal Proximity (40%)     |
                                    |  2. Trajectory-Drift Alignment (25%)    |
                                    |  3. Vessel Risk Profile (20%)           |
                                    |  4. AIS Signal Continuity/Anomalies(15%)|
                                    +-----------------------------------------+
```

---

## 2. Component Breakdown

### 2.1 Frontend (`/src`)
- **Technology**: React 19, TypeScript, Vite, Tailwind CSS, Leaflet / React-Leaflet.
- **Layers**:
  - **Tile Layer**: Multi-provider high-resolution satellite imagery (Esri World Imagery) with clear national boundaries and place names.
  - **SAR Raster / Mask Layer**: Native rendering of model-inferred segmentation masks with interactive opacity slider.
  - **Vector Layer**: Interactive markers and trajectory lines showing vessel paths and reverse hindcast drift cones.
  - **Dashboard Modules**:
    - `SpillDetectionPage`: SAR upload, auto-trigger segmentation, metric cards (Area, Confidence, Coordinates, Time).
    - `MapContainer` & `MapControls`: Seamless switching between satellite, dark nautical, and coastal views.
    - `AttributionPanel`: Ranked list of suspect vessels with forensic breakdown.

### 2.2 AI / ML Pipeline (`/backend/main.py`)
- **Model**: U-Net with ResNet-34 Encoder (pre-trained on maritime SAR imagery).
- **Input Channels**: Single-channel radar backscatter intensity (Sentinel-1 SAR VV polarization).
- **Inference Strategy**:
  - Normalizes input SAR imagery to zero mean and unit variance.
  - Generates pixel-level probability masks thresholded at `p > 0.5`.
  - Contour extraction extracts slick polygons, area calculation ($km^2$), and centroid georeferencing.
  - Fallback CV adaptive thresholding ensures resilience in edge environments without GPU.

### 2.3 Maritime Physics & Hindcast Drift Engine
- **Hydrodynamic Advection**: Computes total slick displacement vector:
  $$\vec{V}_{slick} = \vec{V}_{current} + 0.03 \cdot \vec{V}_{wind}$$
- **Fay Spreading Model**: Simulates physical spread of oil volume over time across gravity, viscous, and surface-tension phases.
- **Reverse Hindcast**: Back-propagates the spill location backwards in time ($T - \Delta t$) with an expanding uncertainty cone to identify candidate discharge coordinates.

### 2.4 4-Pillar Vessel Attribution Algorithm
Calculates a composite confidence score ($0 - 100\%$) for every vessel operating in the vicinity during the hindcast window:
1. **Spatio-Temporal Proximity (40%)**: Minimum distance between vessel AIS coordinate and hindcast spill origin.
2. **Trajectory Alignment (25%)**: Angular difference between vessel heading vector and slick elongation axis.
3. **Vessel Risk Profile (20%)**: Cargo type (crude oil tanker, chemical carrier, bulk carrier), flag state, and historical safety inspection records.
4. **AIS Behavioral Anomalies (15%)**: Detection of deliberate AIS transponder deactivations ("dark vessel" behavior), sudden speed drops, or erratic zig-zag maneuvers.

---

## 3. Data Flow

```
[Satellite SAR Image (Sentinel-1)]
               │
               ▼
[Backend: ResNet-34 U-Net Inference] ──► [Slick Mask + Area + Geo Coordinates]
                                                           │
                                                           ▼
[Meteo-Oceanic Data (Wind & Current)] ──► [Hindcast Reverse Drift Engine]
                                                           │
                                                           ▼
                                               [Spill Origin Zone (Lat, Lon, T_0)]
                                                           │
[AIS Historical Vessel Trajectories] ◄─────────────────────┘
               │
               ▼
[4-Pillar Attribution Engine] ──► [Ranked Suspect Vessels + Confidence %]
                                               │
                                               ▼
                         [Interactive Web UI Dashboard (React + Leaflet)]
```
