export interface Evidence {
  id: string;
  case_id: string;
  filename: string;
  format: string;
  size_bytes: number;
  sha256?: string;
  filesystem?: string;
  status: 'PENDING' | 'ANALYZING' | 'READY' | 'FAILED';
  added_at: string;
}

export interface Partition {
  id: string;
  evidence_id: string;
  type: string;
  offset: number;
  size_bytes: number;
  filesystem?: string;
  status: string;
}

export interface FilesystemInfo {
  evidence_id: string;
  filesystem: string;
  volume_name?: string;
  cluster_size?: number;
  metadata_support: boolean;
  deleted_file_support: boolean;
}

export interface EngineAnalysis {
  engine: string;
  operation: string;
  status: 'USED' | 'NOT_REQUIRED' | 'FAILED' | 'PENDING';
}

export interface EvidenceRecoveryJob {
  id: string;
  evidence_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  engines_used: string[];
  recovered_files_count: number;
  fragments_count: number;
}

import { apiFetch, BACKEND_URL, RECOVERY_URL } from './client';

// Mocks or real endpoints - we are implementing real signatures
export const evidenceApi = {
  async getEvidenceList(caseId?: string): Promise<Evidence[]> {
    const url = caseId ? `${BACKEND_URL}/api/evidence?case_id=${caseId}` : `${BACKEND_URL}/api/evidence`;
    return apiFetch<Evidence[]>(url);
  },
  async getEvidenceById(id: string): Promise<Evidence> {
    return apiFetch<Evidence>(`${BACKEND_URL}/api/evidence/${id}`);
  },
  async getEvidencePartitions(id: string): Promise<Partition[]> {
    return apiFetch<Partition[]>(`${BACKEND_URL}/api/evidence/${id}/partitions`);
  },
  async getEvidenceFilesystems(id: string): Promise<FilesystemInfo[]> {
    return apiFetch<FilesystemInfo[]>(`${BACKEND_URL}/api/evidence/${id}/filesystems`);
  },
  async getEvidenceAnalysis(id: string): Promise<EngineAnalysis[]> {
    return apiFetch<EngineAnalysis[]>(`${BACKEND_URL}/api/evidence/${id}/analysis`);
  },
  async getEvidenceRecoveries(id: string): Promise<EvidenceRecoveryJob[]> {
    return apiFetch<EvidenceRecoveryJob[]>(`${BACKEND_URL}/api/evidence/${id}/recoveries`);
  },
  async uploadEvidence(caseId: string, file: File): Promise<Evidence> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', caseId);
    const res = await fetch(`${BACKEND_URL}/api/evidence`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`Failed to upload: ${res.statusText}`);
    }
    return res.json() as Promise<Evidence>;
  },
  async analyzeEvidence(id: string): Promise<void> {
    await apiFetch(`${BACKEND_URL}/api/evidence/${id}/analyze`, { method: 'POST' });
  },
  async startRecovery(id: string): Promise<string> {
    // Starts a recovery job, might talk to RECOVERY_URL or BACKEND_URL. Assuming BACKEND orchestrates it.
    const res = await apiFetch<{ job_id: string }>(`${BACKEND_URL}/api/evidence/${id}/recover`, { method: 'POST' });
    return res.job_id;
  }
};
