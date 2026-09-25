export interface Case {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  evidence_count: number;
  recoveries_count: number;
}

export interface CaseEvidence {
  id: string;
  filename: string;
  format: string;
  size_bytes: number;
  sha256: string;
  filesystem: string;
  status: string;
  added_at: string;
}

export interface CaseRecovery {
  id: string;
  evidence_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  engines_used: string[];
  fragments_extracted: number;
  files_recovered: number;
}

export interface CaseFile {
  id: string;
  filename: string;
  detected_type: string;
  size_bytes: number;
  recovery_method: string;
  source_engine: string;
  fragments_count: number;
  integrity_score: number;
  confidence: number;
  status: string;
}

export interface CaseTimelineEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface CaseFragment {
  id: string;
  offset: number;
  size_bytes: number;
  entropy: number;
  magic_bytes: string | null;
  status: string;
}

export interface CaseGraphNode {
  id: string;
  label: string;
  type: string;
}

export interface CaseGraphEdge {
  id: string;
  source: string;
  target: string;
  score: number;
}

export interface CaseGraphData {
  nodes: CaseGraphNode[];
  edges: CaseGraphEdge[];
}

export interface CaseValidation {
  id: string;
  rule: string;
  status: string;
  message: string;
  timestamp: string;
}

export interface CaseReport {
  id: string;
  title: string;
  type: string;
  created_at: string;
  url: string;
}

export interface CaseAudit {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface CasesApi {
  getCases(): Promise<Case[]>;
  createCase(name: string, description: string): Promise<Case>;
  getCase(caseId: string): Promise<Case>;
  getCaseEvidence(caseId: string): Promise<CaseEvidence[]>;
  getCaseRecoveries(caseId: string): Promise<CaseRecovery[]>;
  getCaseFiles(caseId: string): Promise<CaseFile[]>;
  getCaseTimeline(caseId: string): Promise<CaseTimelineEvent[]>;
  getCaseFragments(caseId: string): Promise<CaseFragment[]>;
  getCaseGraph(caseId: string): Promise<CaseGraphData>;
  getCaseValidation(caseId: string): Promise<CaseValidation[]>;
  getCaseReports(caseId: string): Promise<CaseReport[]>;
  getCaseAudit(caseId: string): Promise<CaseAudit[]>;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_API ?? 'http://localhost:5000';

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const casesApi: CasesApi = {
  getCases: () => apiFetch<Case[]>(`${BACKEND_URL}/api/cases`),
  createCase: (name, description) => 
    apiFetch<Case>(`${BACKEND_URL}/api/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    }),
  getCase: (caseId) => apiFetch<Case>(`${BACKEND_URL}/api/cases/${caseId}`),
  getCaseEvidence: (caseId) => apiFetch<CaseEvidence[]>(`${BACKEND_URL}/api/cases/${caseId}/evidence`),
  getCaseRecoveries: (caseId) => apiFetch<CaseRecovery[]>(`${BACKEND_URL}/api/cases/${caseId}/recoveries`),
  getCaseFiles: (caseId) => apiFetch<CaseFile[]>(`${BACKEND_URL}/api/cases/${caseId}/files`),
  getCaseTimeline: (caseId) => apiFetch<CaseTimelineEvent[]>(`${BACKEND_URL}/api/cases/${caseId}/timeline`),
  getCaseFragments: (caseId) => apiFetch<CaseFragment[]>(`${BACKEND_URL}/api/cases/${caseId}/fragments`),
  getCaseGraph: (caseId) => apiFetch<CaseGraphData>(`${BACKEND_URL}/api/cases/${caseId}/graph`),
  getCaseValidation: (caseId) => apiFetch<CaseValidation[]>(`${BACKEND_URL}/api/cases/${caseId}/validation`),
  getCaseReports: (caseId) => apiFetch<CaseReport[]>(`${BACKEND_URL}/api/cases/${caseId}/reports`),
  getCaseAudit: (caseId) => apiFetch<CaseAudit[]>(`${BACKEND_URL}/api/cases/${caseId}/audit`),
};
