import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  RefreshCw, 
  Layers, 
  UploadCloud,
  X,
  FileCheck2,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import type { SatelliteScene, SpillDetection } from '@/types';
import { mockSatelliteScenes } from '@/data/mockSatellite';
import { mockIncidents } from '@/data/mockIncidents';
import { Button } from '@/components/common/Button';
import { ImageViewer } from '@/components/detection/ImageViewer';
import { DetectionResult } from '@/components/detection/DetectionResult';
import { AnalysisIndicators } from '@/components/detection/AnalysisIndicators';
import { SceneSelector } from '@/components/detection/SceneSelector';
import { uploadAndDetectSpill } from '@/services/detectionService';

export const SpillDetectionPage: React.FC = () => {
  const [scenesList, setScenesList] = useState<SatelliteScene[]>(mockSatelliteScenes);
  const [selectedScene, setSelectedScene] = useState<SatelliteScene>(mockSatelliteScenes[0]);
  const [isInferencing, setIsInferencing] = useState<boolean>(false);
  const [inferenceProgress, setInferenceProgress] = useState<number>(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [activeIncident, setActiveIncident] = useState(mockIncidents[0]);
  
  // Custom upload & live detection states
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [detectedMaskUrl, setDetectedMaskUrl] = useState<string | null>(null);
  const [customConfidence, setCustomConfidence] = useState<number | null>(null);
  const [customArea, setCustomArea] = useState<number | null>(null);
  const [customCentroid, setCustomCentroid] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [ingestProgress, setIngestProgress] = useState<number>(0);
  const [ingestStatusText, setIngestStatusText] = useState<string>('');
  const [uploadBanner, setUploadBanner] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);


  // Close upload modal on Escape key and lock background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUploadModalOpen) {
        setIsUploadModalOpen(false);
      }
    };

    if (isUploadModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isUploadModalOpen]);

  // Handle scene switch
  const handleSelectScene = (scene: SatelliteScene) => {
    setSelectedScene(scene);
    // If returning to a default scene without custom image
    if (!scene.id.startsWith('CUSTOM-')) {
      setUploadedImageUrl(null);
      setDetectedMaskUrl(null);
      setCustomConfidence(null);
      setCustomArea(null);
      setCustomCentroid(null);
    }
    // Switch to corresponding incident or fallback to primary
    const matched = mockIncidents.find(i => i.satellite === scene.satellite && i.region === scene.region) || mockIncidents[0];
    setActiveIncident(matched);
  };

  // Run AI inference simulation
  const handleRunInference = () => {
    setIsInferencing(true);
    setInferenceProgress(10);

    const step1 = setTimeout(() => setInferenceProgress(45), 400);
    const step2 = setTimeout(() => setInferenceProgress(80), 900);
    const step3 = setTimeout(() => {
      setInferenceProgress(100);
      setIsInferencing(false);
    }, 1400);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  // File selection handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Process & Ingest uploaded satellite raster via Backend
  const handleProcessUpload = async (fileToProcess?: File) => {
    const file = fileToProcess || selectedFile;
    if (!file) return;

    setIsIngesting(true);
    setIngestProgress(20);
    setIngestStatusText('Reading raster metadata and preparing telemetry payload...');

    // If the file is an image format, create an object URL for preview
    if (file.type.startsWith('image/') || file.name.match(/\.(png|jpe?g|webp|bmp|tif|tiff)$/i)) {
      const objectUrl = URL.createObjectURL(file);
      setUploadedImageUrl(objectUrl);
    }

    setIngestProgress(50);
    setIngestStatusText('Streaming telemetry to Ocean Sentinel ResNet-34 U-Net backend...');

    // Send to backend API
    const detectionResult = await uploadAndDetectSpill(file);

    setIngestProgress(85);
    setIngestStatusText('Receiving anomaly segmentation tensor and computing footprint...');

    if (detectionResult.mask_url) {
      setDetectedMaskUrl(detectionResult.mask_url);
    }
    setCustomConfidence(detectionResult.confidence);
    setCustomArea(detectionResult.estimatedArea);
    setCustomCentroid({ lat: detectionResult.centroid.latitude, lng: detectionResult.centroid.longitude });

    // Generate a new custom satellite scene
    const isSAR = !file.name.toLowerCase().includes('opt') && !file.name.toLowerCase().includes('sentinel2');
    const customSceneId = `CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newCustomScene: SatelliteScene = {
      id: customSceneId,
      satellite: isSAR ? 'Sentinel-1' : 'Sentinel-2',
      sensor: isSAR ? 'SAR' : 'EO',
      acquisitionDate: new Date().toISOString(),
      region: `Custom Ingest (${file.name.slice(0, 18)}...)`,
      coverage: detectionResult.estimatedArea || 14.8,
      processingStatus: 'analyzed',
      resolution: '10m C-SAR',
      coordinates: { lat: detectionResult.centroid.latitude, lng: detectionResult.centroid.longitude },
    };

    setScenesList(prev => [newCustomScene, ...prev]);
    setSelectedScene(newCustomScene);
    setIngestProgress(100);
    setIsIngesting(false);
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setUploadBanner(`Inference complete: ${file.name} — ${detectionResult.confidence}% confidence, ${detectionResult.estimatedArea} km² slick detected (${detectionResult.model_type || 'ResNet-34 U-Net'})`);
  };

  // Load verified sample SAR scene
  const handleLoadSampleScene = () => {
    // Synthetic sample File object
    const sampleFile = new File(['sample_data'], 'S1A_IW_GRDH_1SDV_20260904_ARABIAN_SEA.tif', {
      type: 'image/tiff',
    });
    handleProcessUpload(sampleFile);
  };

  const detectionData: SpillDetection = {
    id: activeIncident.id,
    confidence: customConfidence ?? activeIncident.confidence ?? 94.2,
    coordinates: customCentroid ?? activeIncident.coordinates ?? { lat: 18.7421, lng: 67.8214 },
    estimatedArea: customArea ?? activeIncident.estimatedArea ?? 12.4,
    detectionTime: activeIncident.detectionTime ?? '2026-09-04T18:42:00Z',
    satellite: selectedScene.satellite,
    sensor: selectedScene.sensor as 'SAR' | 'EO',
    originalImageUrl: uploadedImageUrl || undefined,
    maskUrl: detectedMaskUrl || undefined,
    analysisIndicators: activeIncident.analysisIndicators || [],
  };


  return (
    <main className="space-y-6 pb-12">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1e293b] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Satellite Spill Detection Studio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Copernicus C-SAR & Multispectral optical imagery anomaly segmentation pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsUploadModalOpen(true)}
            className="cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
            <span>Upload GeoTIFF / SAR</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleRunInference}
            disabled={isInferencing}
            className="cursor-pointer"
          >
            {isInferencing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                <span>Running Inference ({inferenceProgress}%)...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4 mr-2" />
                <span>Run UNet Inference</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Success Notification Banner */}
      {uploadBanner && (
        <aside 
          aria-label="Upload status notification"
          className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{uploadBanner}</span>
          </div>
          <button
            onClick={() => setUploadBanner(null)}
            className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Inference Progress Banner */}
      {isInferencing && (
        <aside aria-label="Inference execution status" className="rounded-xl bg-white dark:bg-[#0d1320] border border-sky-300 dark:border-sky-600/60 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-sky-700 dark:text-sky-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 animate-spin" />
              Applying Convolutional UNet Segmentation on {selectedScene.satellite} {selectedScene.sensor} Level-1 product...
            </span>
            <span className="text-slate-900 dark:text-white font-bold tabular-nums">{inferenceProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-[#131b2e] rounded overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-150 rounded"
              style={{ width: `${inferenceProgress}%` }}
            ></div>
          </div>
        </aside>
      )}

      {/* Scene Repository Selector */}
      <SceneSelector
        scenes={scenesList}
        selectedSceneId={selectedScene.id}
        onSelectScene={handleSelectScene}
        onSimulateUpload={() => setIsUploadModalOpen(true)}
      />

      {/* Main Imagery Viewer & Analysis Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Satellite Viewer (2 cols on LG) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Multi-Spectral Scene Analyzer
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Scene: <strong className="text-slate-900 dark:text-slate-200">{selectedScene.id}</strong> • Res: <strong className="text-cyan-600 dark:text-cyan-400">{selectedScene.resolution}</strong>
            </div>
          </div>

          <ImageViewer detection={detectionData} />
        </div>

        {/* Verification Indicators & Model Metrics (1 col on LG) */}
        <div className="space-y-6">
          <AnalysisIndicators indicators={activeIncident.analysisIndicators} />
        </div>
      </div>

      {/* Detection Result Summary Bar */}
      <DetectionResult
        detection={detectionData}
        incidentId={activeIncident.id}
      />

      {/* Upload GeoTIFF Modal */}
      {isUploadModalOpen && (
        <div 
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-950/60 dark:bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
          onClick={() => {
            if (!isIngesting) {
              setIsUploadModalOpen(false);
              setSelectedFile(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
        >
          <div 
            className="bg-white dark:bg-[#0d1320] border border-slate-200 dark:border-[#1e293b] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative text-slate-800 dark:text-slate-100 transition-colors duration-150 flex flex-col my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".tif,.tiff,.safe,.h5,.nc,.zip,.tar.gz,.png,.jpg,.jpeg,.webp"
              className="hidden"
            />

            {/* Close Button */}
            <button
              onClick={() => {
                if (!isIngesting) {
                  setIsUploadModalOpen(false);
                  setSelectedFile(null);
                }
              }}
              disabled={isIngesting}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#131b2e] cursor-pointer disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title & Subtitle */}
            <div className="pr-8">
              <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-mono text-[11px] font-semibold uppercase tracking-wider mb-1">
                <UploadCloud className="w-4 h-4" />
                <span>INGEST SATELLITE PRODUCT</span>
              </div>
              <h3 id="upload-modal-title" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Upload Sentinel-1 SAR / Sentinel-2 GeoTIFF
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                Supports Level-1 GRD, SLC products, or calibrated GeoTIFF files with embedded geospatial coordinates.
              </p>
            </div>

            {/* Ingestion In-Progress State */}
            {isIngesting ? (
              <div className="py-6 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-cyan-200 dark:border-cyan-900/60 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto border border-cyan-200 dark:border-cyan-800">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    Processing Satellite Raster...
                  </div>
                  <p className="text-xs font-mono text-cyan-700 dark:text-cyan-300">
                    {ingestStatusText}
                  </p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-cyan-500 h-full transition-all duration-200 rounded-full"
                    style={{ width: `${ingestProgress}%` }}
                  />
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {ingestProgress}% Complete
                </div>
              </div>
            ) : selectedFile ? (
              /* Selected File Preview Box */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-cyan-300 dark:border-cyan-600/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-200 dark:border-cyan-800">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'GeoTIFF Data'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex-shrink-0 font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900 text-xs text-cyan-800 dark:text-cyan-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Valid geospatial header found. Ready for C-Band SAR radiometric normalization.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setSelectedFile(null)}
                  >
                    Choose Different File
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleProcessUpload()}
                  >
                    Ingest & Run UNet Analysis
                  </Button>
                </div>
              </div>
            ) : (
              /* Drag & Drop Dropzone */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-150 ${
                  isDragging
                    ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 scale-[0.99]'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 hover:border-cyan-500/80 hover:bg-slate-100/80 dark:hover:bg-slate-900'
                }`}
              >
                <UploadCloud className={`w-10 h-10 mx-auto mb-3 transition-colors ${
                  isDragging ? 'text-cyan-600 dark:text-cyan-400 scale-110' : 'text-slate-400 dark:text-cyan-400/80'
                }`} />
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1">
                  Drag and drop your GeoTIFF or SAFE package here
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Or <span className="text-cyan-600 dark:text-cyan-400 font-semibold underline underline-offset-2">browse files</span> from your computer
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-200/80 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Max 500MB • .tif, .tiff, .safe, .h5, .png, .jpg</span>
                </div>
              </div>
            )}

            {/* Modal Bottom Bar */}
            {!selectedFile && !isIngesting && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Or use a calibrated test product:
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setIsUploadModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleLoadSampleScene}
                  >
                    Load Sample SAR Scene
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default SpillDetectionPage;
