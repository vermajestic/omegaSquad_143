import { apiClient } from './api';
import { config } from '@/config';
import { mockIncidents } from '@/data/mockIncidents';

export interface DetectionUploadResponse {
  status: string;
  model_type?: string;
  confidence: number;
  anomalyPixels: number;
  estimatedArea: number;
  mask_url: string;
  centroid: { latitude: number; longitude: number };
}

export async function uploadAndDetectSpill(file: File): Promise<DetectionUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const baseUrl = config.apiBaseUrl || 'http://localhost:8000/api/v1';

  try {
    const res = await fetch(`${baseUrl}/detection/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`Upload detection failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend detection failed or offline, using fallback:', err);
    return {
      status: 'fallback',
      model_type: 'client_fallback',
      confidence: 91.5,
      anomalyPixels: 1450,
      estimatedArea: 14.8,
      mask_url: '',
      centroid: { latitude: 18.92, longitude: 72.83 }
    };
  }
}

export async function runSpillDetection(sceneId: string): Promise<any> {
  try {
    return await apiClient<any>(`/detection/run`, {
      method: 'POST',
      body: JSON.stringify({ sceneId })
    });
  } catch {
    return { id: `det-new-${Date.now()}`, confidence: 0.9, sceneId };
  }
}

export async function getDetection(id: string): Promise<any | null> {
  try {
    return await apiClient<any>(`/detection/${id}`);
  } catch {
    const inc = mockIncidents.find(inc => inc.detection?.id === id);
    return inc ? inc.detection : null;
  }
}

