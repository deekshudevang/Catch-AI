/**
 * CATCH-AI API Client
 *
 * All API calls go through this layer.
 * The recovery-service (Python/FastAPI) runs on port 8000.
 * The recovery-backend (Node/Express) runs on port 5000.
 *
 * The React app talks to recovery-service directly for orchestration
 * and to recovery-backend for job history and system health.
 */

export const RECOVERY_URL = import.meta.env.VITE_RECOVERY_API ?? 'http://localhost:8000';
export const BACKEND_URL  = import.meta.env.VITE_BACKEND_API  ?? 'http://localhost:5000';

// ─── Shared fetch helper ──────────────────────────────────────────────────────

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EngineHealth {
  [engine: string]: string;
}

export interface HealthResponse {
  status: 'OK' | 'DEGRADED';
  engines: EngineHealth;
  database?: string;
}

export interface RecoverRequest {
  image_path: string;
}

export interface RecoveryResult {
  execution_id: string;
  image_path:   string;
  fragments_extracted:   number;
  relationships_scored:  number;
  graph: { nodes: number; edges: number };
  status: string;
}

export interface RecoverResponse {
  success: boolean;
  data: RecoveryResult;
}

export interface GraphNode {
  id:         string;
  label:      string;
  type:       string;
  x:          number;
  y:          number;
  entropy?:   number;
  length?:    number;
  offset?:    number;
  file_type?: string;
  color?:     string;
  magic_bytes?: string;
  mean_byte?: number;
}

export interface GraphEdge {
  source:            string;
  target:            string;
  weight:            number;
  relationship_type: string;
}

export interface GraphMeta {
  total_fragments:      number;
  total_relationships:  number;
  scan_source?:         string;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta:  GraphMeta;
}

export interface IntegrationEngine {
  id:                 string;
  name:               string;
  repository:         string;
  status:             string;
  version:            string;
  capabilities:       string[];
  source_present:     boolean;
  dependency_ready:   boolean;
  runtime_ready:      boolean;
  integration_tested: boolean;
  actually_used:      boolean;
  last_tested?:       string;
  last_used?:         string;
}

export interface IntegrationReport {
  engines:  IntegrationEngine[];
  summary?: { total: number; ready: number; failed: number };
}

export interface RecoveryJob {
  id:           number;
  image_path:   string;
  status:       string;
  execution_id: string | null;
  fragments:    number;
  relationships:number;
  created_at:   string;
}

export interface JobsResponse {
  jobs: RecoveryJob[];
}

export interface ScanRequest {
  imagePath: string;
}

export interface ScanResponse {
  success: boolean;
  jobId:   number;
  data:    RecoveryResult;
}

// ─── Recovery service (port 8000) ─────────────────────────────────────────────

export const recoveryApi = {
  health(): Promise<HealthResponse> {
    return apiFetch(`${RECOVERY_URL}/api/health`);
  },

  recover(imagePath: string): Promise<RecoverResponse> {
    return apiFetch(`${RECOVERY_URL}/api/orchestrate/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_path: imagePath }),
    });
  },

  graph(): Promise<GraphResponse> {
    return apiFetch(`${RECOVERY_URL}/api/orchestrate/graph`);
  },

  integrationReport(): Promise<IntegrationReport> {
    return apiFetch(`${RECOVERY_URL}/api/system/integration-report`);
  },
};

// ─── Backend proxy (port 5000) ────────────────────────────────────────────────

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

  jobs(): Promise<JobsResponse> {
    return apiFetch(`${BACKEND_URL}/api/recover/jobs`);
  },
};
