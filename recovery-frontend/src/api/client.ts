export const BACKEND_URL = import.meta.env.VITE_BACKEND_API ?? 'http://localhost:8000';

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`[${url}] HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface EngineHealth {
  [engine: string]: string;
}

export interface HealthResponse {
  status: 'OK' | 'DEGRADED';
  engines: EngineHealth;
  database?: string;
}

export interface RecoveryJob {
  id: string;
  job_id: string;
  evidence: string;
  status: string;
  created_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration: string;
  artifacts: number;
  fragments?: number;
  carved_files?: number;
  image_path?: string;
}

export interface JobsResponse {
  jobs: RecoveryJob[];
}

export interface ScanResponse {
  success: boolean;
  job_id: string;
  jobId: string;
  status: string;
  total_files_found: number;
}

export interface Artifact {
  artifact_id: string;
  filename: string;
  type: string;
  size: number;
  sha256: string;
  source_engine: string;
  recovery_job_id: string;
  validation_status: string | null;
  reconstruction_id: string | null;
}

export interface JobDetails {
  id: string;
  evidence_id: string;
  case_id: string | null;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number;
  files_found: number;
  deleted_files: number;
  recoverable: number;
  recovered: number;
  partial: number;
  fragments: number;
  reconstructions: number;
  validation_failures: number;
}

export const backendApi = {
  health(): Promise<HealthResponse> {
    return apiFetch(`${BACKEND_URL}/api/health`);
  },
  scan(imagePath: string): Promise<ScanResponse> {
    return apiFetch(`${BACKEND_URL}/api/recover/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePath }),
    });
  },
  upload(file: File): Promise<ScanResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch(`${BACKEND_URL}/api/recover/upload`, {
      method: 'POST',
      body: formData,
    });
  },
  jobs(): Promise<JobsResponse> {
    return apiFetch(`${BACKEND_URL}/api/recover/jobs`);
  },
  jobDetails(id: string): Promise<JobDetails> {
    return apiFetch(`${BACKEND_URL}/api/recoveries/${id}`);
  },
  artifacts(id: string): Promise<Artifact[]> {
    return apiFetch(`${BACKEND_URL}/api/recoveries/${id}/artifacts`);
  },
  artifact(id: string): Promise<Artifact> {
    return apiFetch(`${BACKEND_URL}/api/artifacts/${id}`);
  },
  artifactDownloadUrl(id: string): string {
    return `${BACKEND_URL}/api/artifacts/${id}/download`;
  },
  fetchData(directory: string): Promise<any> {
    return apiFetch(`${BACKEND_URL}/api/recover/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directory }),
    });
  },
  monitor(directory: string): Promise<any> {
    return apiFetch(`${BACKEND_URL}/api/recover/monitor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directory }),
    });
  },
  sentinelStatus(): Promise<any> {
    return apiFetch(`${BACKEND_URL}/api/v1/sentinel/status`);
  },
  systemPrivileges(): Promise<any> {
    return apiFetch(`${BACKEND_URL}/api/system/privileges`);
  },
  systemElevate(): Promise<any> {
    return apiFetch(`${BACKEND_URL}/api/system/elevate`, {
      method: 'POST'
    });
  }
};

export const recoveryApi = backendApi;
