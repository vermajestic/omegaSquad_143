# Ocean Sentinel — AI Satellite Oil Spill Detection & Maritime Attribution System

> **Smart India Hackathon (SIH 2026)**  
> **Team Name:** Omega Squad | **Team ID:** 143  
> **Repository:** [https://github.com/vermajestic/omegaSquad_143.git](https://github.com/vermajestic/omegaSquad_143.git)

---

## 1. Project Information

- **Project Title:** Ocean Sentinel – AI Satellite Oil Spill Detection & Maritime Attribution System
- **PS ID:** 26143
- **PS Title:** Leveraging satellite imagery to determine Oil spills at sea along with AIS data correlations to identify vessel responsible for the spill
- **Organization:** National Technical Research Organisation (NTRO)
- **Category:** Software
- **Theme:** Disaster Management

---

## 2. Problem Statement

Marine oil discharges—from catastrophic maritime accidents to deliberate, clandestine bilge dumping in Exclusive Economic Zones (EEZs)—cause severe, long-lasting ecological devastation. 

Key challenges faced by maritime enforcement agencies:
1. **Detection Lag:** Vast ocean expanses make manual inspection slow and dependent on infrequent physical maritime patrols.
2. **Dynamic Ocean Dispersion:** Wind drag and ocean currents continuously displace and disperse slicks, obscuring the original spill site ($t_0$).
3. **Attribution Complexity:** Hundreds of vessels transit oceanic choke-points daily; isolating the culprit vessel among noisy, incomplete, or manipulated AIS transponder data requires verifiable forensic correlation.

---

## 3. Proposed Solution

**Ocean Sentinel** is an end-to-end autonomous maritime surveillance and forensic attribution platform that:
- Ingests **Copernicus Sentinel-1 SAR (Synthetic Aperture Radar)** backscatter imagery and applies a pre-trained **ResNet-34 U-Net** deep learning model to segment oil slicks in real-time.
- Executes **hydrodynamic reverse hindcasting** incorporating surface ocean current advection and 10-meter atmospheric wind drag to compute the true origin release point ($t_0$) and forward coastal impact cones ($+12\text{h}$, $+24\text{h}$, $+48\text{h}$).
- Correlates historical **Automatic Identification System (AIS)** vessel traffic within the spatio-temporal transit corridor via a **4-Pillar Forensic Attribution Engine** to rank suspects with quantifiable confidence scores.
- Formulates **MARPOL 73/78 Annex I compliant audit packages** with cryptographic evidence exports for Coast Guard and international maritime prosecution.

---

## 4. Key Features

- **🛰️ Deep Learning SAR Segmentation:** ResNet-34 U-Net inference optimized for single-channel radar backscatter; extracts slick area ($\text{km}^2$), contour polygons, and centroid coordinates.
- **⏪ Hydrodynamic Drift Modeling:** Computes backward trajectory drift vectors to locate the release event and simulates forward dispersion forecasting.
- **🚢 4-Pillar Vessel Attribution:** Ranks candidate vessels using Spatio-Temporal Proximity ($40\%$), Trajectory Alignment ($25\%$), Risk Profile ($20\%$), and AIS Transponder Continuity/Dark-Vessel Detection ($15\%$).
- **🗺️ Zero-Config Satellite GIS:** Leaflet-based interactive command center featuring high-resolution Esri World Imagery (zero watermarks, no API keys required), dark tactical mode, and bathymetric layers.
- **⚖️ Legal Enforcement Dossier:** One-click MARPOL 73/78 Annex I compliant evidence export for rapid Coast Guard deployment.
- **⚡ One-Click Startup:** Ready-to-run Windows `start.bat` launcher that initializes backend inference and frontend visualization simultaneously.

---

## 5. System Architecture

For in-depth architectural details, mathematical formulation, and model parameters, see [docs/architecture.md](docs/architecture.md).

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

## 6. Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts |
| **GIS Mapping** | Leaflet, React-Leaflet, Esri ArcGIS World Imagery, Esri Ocean Base |
| **Backend API** | FastAPI, Uvicorn, Python 3.10+ |
| **Deep Learning** | PyTorch, Segmentation Models PyTorch (SMP), ResNet-34 U-Net, Torchvision |
| **Data & Geometry** | NumPy, SciPy, Pillow, GeoJSON, Shapely |

---

## 7. Project Structure

```plaintext
ocean-sentinel/
├── assets/
│   └── screenshots/                # Application captures & UI walkthrough
│       ├── 01_dashboard.png
│       ├── 02_overview.png
│       ├── 03_live_monitoring.png
│       ├── 04_spill_detection.png
│       ├── 05_spill_detetection2.png
│       ├── 06_analytics.png
│       ├── 07_reports.png
│       └── README.md
├── backend/
│   ├── main.py                     # FastAPI REST server & ResNet-34 U-Net inference engine
│   ├── requirements.txt            # Python dependencies (Torch, FastAPI, SMP, etc.)
│   ├── unet_resnet34_best/         # PyTorch trained model weights and tensors
│   └── sample/
│       └── ais_sample.csv          # Sample maritime AIS telemetry stream
├── docs/
│   └── architecture.md             # Detailed system architecture and mathematical models
├── submission/
│   ├── DEMO.md                     # YouTube unlisted video demonstration details
│   └── PRESENTATION.md             # Google Drive presentation link and slide outline
├── src/
│   ├── components/
│   │   ├── attribution/            # 4-Pillar evidence cards, score breakdown, disclaimer
│   │   ├── detection/              # Multi-spectral scene analyzer, canvas viewer, metrics
│   │   ├── map/                    # Leaflet GIS container, drift simulation, vessel tracks
│   │   └── vessel/                 # AIS candidate table, PCA track inspector
│   ├── pages/                      # Detection Studio, Vessel Intelligence, Attribution, Reports
│   ├── services/                   # API clients & backend communication (detectionService)
│   └── types/                      # TypeScript schemas for incidents, vessels, detections
├── start.bat                       # Windows one-click automated startup script
├── package.json                    # Frontend npm dependencies and build scripts
├── vite.config.ts                  # Vite build and proxy configuration
└── README.md                       # Project master documentation
```

---

## 8. Setup and Installation

### Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.10 or higher) & **pip**
- Modern Web Browser (Chrome, Edge, Firefox)

### Step 1: Clone Repository
```bash
git clone https://github.com/vermajestic/omegaSquad_143.git
cd omegaSquad_143
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

---

## 9. Usage / How to Run

### Method A: One-Click Launch (Windows)
Double-click the **`start.bat`** file in the project root directory.  
It will automatically:
1. Boot the FastAPI ML inference server on `http://localhost:8000`.
2. Boot the Vite React development server on `http://localhost:5173`.
3. Open your browser directly to Ocean Sentinel.

### Method B: Manual Execution

#### Terminal 1 — Start ML Backend:
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 2 — Start Frontend:
```bash
npm run dev
```
Navigate to: **`http://localhost:5173`**

---

## 10. Screenshots

### 1. Dashboard Overview
![Dashboard Overview](assets/screenshots/01_dashboard.png)

### 2. Live Maritime Monitoring
![Live Maritime Monitoring](assets/screenshots/03_live_monitoring.png)

### 3. AI SAR Spill Segmentation & Mask Analysis
![SAR Spill Detection](assets/screenshots/04_spill_detection.png)

### 4. Spill Detection Analysis & GeoTIFF Processing
![Spill Detection Analysis](assets/screenshots/05_spill_detetection2.png)

### 5. Analytics & Forensic Attribution
![Analytics](assets/screenshots/06_analytics.png)

### 6. Incident Reports & Environmental Impact Logs
![Reports & Logs](assets/screenshots/07_reports.png)

*(For complete visual documentation, see [assets/screenshots/README.md](assets/screenshots/README.md))*

---

## 11. Demo Video

- **Platform Video Demonstration:** [Watch on YouTube](https://youtu.be/TVkDQeyfqsU)
- **Direct Link:** `https://youtu.be/TVkDQeyfqsU`
- Detailed video timestamps and segment breakdowns are available in [submission/DEMO.md](submission/DEMO.md).

---

## 12. Presentation

- **Slide Deck (Google Drive):** [View Presentation Slides](https://drive.google.com/file/d/1dDokWenjOo_9_UtP0QbXfINCol6P7-w7/view?usp=sharing)
- Complete slide outline and topic breakdown are documented in [submission/PRESENTATION.md](submission/PRESENTATION.md).

---

## 13. Team Details

- **Team Name:** Omega Squad
- **Team ID:** -
- **Primary Contact / Leader:** Raunak Rana (`raunakrana175@gmail.com` / GitHub: [`vermajestic`](https://github.com/vermajestic))
- **Hackathon:** Smart India Hackathon (SIH 2026)
- **Repository:** [https://github.com/vermajestic/omegaSquad_143.git](https://github.com/vermajestic/omegaSquad_143.git)
