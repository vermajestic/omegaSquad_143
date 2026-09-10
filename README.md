# 🌊 Ocean Sentinel (OmegaSquad)
> **AI-Powered Marine Oil Spill Intelligence, Trajectory Hindcasting & Forensic Vessel Attribution Platform**  
> *Developed for Smart India Hackathon (SIH 2026) — Problem Statement ID: 26143 (NTRO)*

---

## 📌 Problem Statement Overview
- **Problem Statement ID:** 26143
- **Title:** Leveraging satellite imagery to determine Oil spills at sea along with AIS data correlations to identify vessel responsible for the spill.
- **Organization:** National Technical Research Organisation (NTRO)
- **Category:** Software
- **Theme:** Disaster Management

### The Challenge
Marine oil spills inflict catastrophic damage on coastal and pelagic ecosystems, yet culprit vessels frequently escape accountability. Ocean Sentinel provides an end-to-end autonomous pipeline to:
1. **Detect & Characterise Slicks** using Copernicus Sentinel-1 C-Band SAR and optical remote sensing data with deep learning segmentation.
2. **Model Dynamic Drift Trajectories** using oceanographic current and wind vectors to trace slicks back to release origin ($t_0$) via **backward hindcasting**, while forecasting forward coastal dispersion cones ($+12\text{h}$, $+24\text{h}$, $+48\text{h}$).
3. **Reconstruct & Correlate AIS Traffic** across space-time corridors, filtering irrelevant vessels and ranking suspects via a rigorous **4-Pillars Forensic Attribution Engine**.
4. **Generate Legal Enforcement Dossiers** producing MARPOL 73/78 Annex I compliant audit packages for the Indian Coast Guard and maritime law enforcement.

---

## 🚀 Key Architectural Features

### 1. 🛰️ Satellite Spill Detection Studio
- **Neural Network Architecture:** ResNet-34 U-Net backbone trained on single-channel C-SAR radar backscatter imagery.
- **Anomaly Detection:** Quantifies capillary wave suppression, pixel anomaly counts, and slick surface footprint area ($\text{km}^2$).
- **Dual-Mode Visualizer:** Split & overlay canvas with adjustable mask opacity, multi-spectral false-color palettes (SAR, Oceanic, Thermal), and live geospatial reticles.
- **Fallback CV Baseline:** Robust computer-vision screening for uncalibrated rasters.

### 2. ⏪ Drift Modeling: Backward Hindcasting & Forward Forecasting
- **Origin Tracing (Hindcast):** Integrates hydrodynamic current vectors and wind drift to trace slicks backward from detection to initial release coordinates ($t_0$).
- **Dispersal Forecast:** Forward projection cones identifying coastal threats at $+12\text{h}$, $+24\text{h}$, and $+48\text{h}$ intervals.

### 3. 🚢 AIS Vessel Intelligence & 4-Pillar Forensic Attribution
- **Corridor Reconstruction:** Reconstructs historical AIS trajectories within selectable spatial radii ($25\text{–}100\text{ km}$) and time windows ($24\text{–}72\text{h}$).
- **Point of Closest Approach (PCA):** Exact spatio-temporal intersection math calculating closest transit distance and time offset.
- **4 Pillars of Correlation:**
  1. **Spatial Proximity (30%):** PCA distance relative to spill origin release point.
  2. **Temporal Correlation (25%):** Transit timing alignment with slick age decay.
  3. **Trajectory Consistency (25%):** Alignment of vessel heading with slick elongation vector.
  4. **AIS Continuity (20%):** Detection of deliberate transponder shutdowns (dark vessel behavior) or anomalous speed variations.
- **Interactive Weights Simulator:** Real-time recalibration of weight distributions for maritime investigators.

### 4. 🗺️ Interactive Maritime GIS Command Center
- High-definition **Esri World Imagery** satellite basemaps with crisp maritime boundary and port reference labels (100% free, zero watermarks, no external API keys required).
- Interactive basemap switcher: **Satellite (Sat)**, **Dark Tactical (Dark)**, and **Bathymetric Depth (Sea)**.

### 5. ⚖️ MARPOL 73/78 Annex I Compliance & Export
- Formatted investigation dossier ready for Indian Coast Guard and IMO legal proceedings.
- One-click cryptographic JSON evidence package export.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts |
| **GIS Mapping** | Leaflet, React-Leaflet, Esri ArcGIS World Imagery, Esri Ocean Base |
| **ML Backend** | FastAPI, PyTorch, Segmentation Models PyTorch (SMP), Torchvision, NumPy, Pillow, Uvicorn |
| **Deep Learning** | ResNet-34 U-Net (1-channel SAR backscatter tensor segmentation) |

---

## 📦 Project Directory Structure

```plaintext
ocean-sentinel/
├── backend/
│   ├── main.py                     # FastAPI REST server & ResNet-34 U-Net inference engine
│   ├── requirements.txt            # Python dependencies (Torch, FastAPI, SMP, etc.)
│   ├── unet_resnet34_best/         # PyTorch trained model checkpoint archive
│   └── sample/
│       └── ais_sample.csv          # Sample maritime AIS telemetry stream
├── src/
│   ├── components/
│   │   ├── attribution/            # 4-Pillar evidence cards, score breakdown, disclaimer
│   │   ├── detection/              # Multi-spectral scene analyzer, canvas viewer, metrics
│   │   ├── map/                    # Leaflet GIS container, drift simulation, vessel tracks
│   │   └── vessel/                 # AIS candidate table, PCA track inspector
│   ├── pages/                      # Detection Studio, Vessel Intelligence, Attribution, Reports
│   ├── services/                   # API clients & backend communication (detectionService)
│   └── types/                      # TypeScript schemas for incidents, vessels, detections
├── .env                            # Application environment configurations
└── vite.config.ts                  # Vite build and plugin configurations
