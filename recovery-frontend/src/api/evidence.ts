export interface Evidence {
  id: string;
  name: string;
  path: string;
  size: number;
  status: string;
  case_id: string;
  filename: string;
  size_bytes: number;
  format: string;
  sha256: string;
  added_at: string;
}

export interface Partition {
  id: string;
  type: string;
  size_bytes: number;
  filesystem: string;
}

export interface EngineAnalysis {
  id: string;
  engine: string;
  operation: string;
  status: string;
}

export interface EvidenceRecoveryJob {
  id: string;
  status: string;
  started_at: string;
  recovered_files_count: number;
  fragments_count: number;
}

export const evidenceApi = {
  list: async (): Promise<{ evidence: Evidence[] }> => ({ evidence: [] }),
  get: async (_id: string): Promise<Evidence> => ({} as Evidence),
  getEvidenceById: async (_id: string): Promise<Evidence> => ({} as Evidence),
  getEvidenceList: async (): Promise<Evidence[]> => [],
  getEvidencePartitions: async (_id: string): Promise<Partition[]> => [],
  getEvidenceAnalysis: async (_id: string): Promise<EngineAnalysis[]> => [],
  getEvidenceRecoveries: async (_id: string): Promise<EvidenceRecoveryJob[]> => [],
};
