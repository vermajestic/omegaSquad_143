# Video Demonstration — Ocean Sentinel

## Video Link
- **YouTube Demonstration (Unlisted)**: [Watch on YouTube](https://youtu.be/TVkDQeyfqsU)
- **Direct URL**: `https://youtu.be/TVkDQeyfqsU`

> [!NOTE]
> This video is hosted on YouTube in unlisted mode for seamless streaming evaluation at high definition (1080p/60fps) without binary file storage overhead in the Git repository.

---

## Video Summary & Highlights

- **Video Duration**: `[e.g., 3:45 minutes]`
- **Resolution**: 1080p HD

### Timeline & Feature Walkthrough

| Timestamp | Segment | Description |
| :---: | :--- | :--- |
| **00:00 - 00:30** | Introduction & Problem Context | Overview of marine oil discharge challenges, Sentinel-1 SAR imagery capabilities |
| **00:30 - 01:15** | Live SAR Spill Detection & ML Inference | Uploading SAR scene, real-time ResNet-34 U-Net segmentation, confidence score, mask opacity slider |
| **01:15 - 01:50** | Interactive Map & Basemap Modes | High-resolution satellite view (Esri World Imagery), dark nautical mode, slick geometry |
| **01:50 - 02:40** | Reverse Hindcast Drift Simulation | Modeling surface ocean currents and wind advection backwards in time to pinpoint spill origin |
| **02:40 - 03:20** | 4-Pillar Suspect Attribution | Identifying candidate vessels via AIS data, proximity, trajectory alignment, and risk scoring |
| **03:20 - End** | Summary & Conclusion | System architecture, scalability, impact for Coast Guard and maritime authorities |

---

## Platform Requirements to Run Locally
If evaluators wish to run the demo locally, follow the instructions in the project root:
1. Double-click `start.bat` on Windows (or run `npm run dev` and `uvicorn backend.main:app --port 8000`).
2. The web application will launch at `http://localhost:5173`.
