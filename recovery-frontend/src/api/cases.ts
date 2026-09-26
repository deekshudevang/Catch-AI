export interface Case {
  id: string;
  name: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
  evidence_count: number;
  recoveries_count: number;
}

export interface CaseAudit {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  details: string;
}

export interface CaseEvidence {
  id: string;
  filename: string;
  format: string;
  size_bytes: number;
  status: string;
}

export interface CaseRecovery {
  id: string;
  status: string;
  started_at: string;
  fragments_extracted: number;
  files_recovered: number;
}

export interface CaseFile {
  id: string;
  filename: string;
  detected_type: string;
  size_bytes: number;
  confidence: number;
  status: string;
}

export interface CaseTimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
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

export interface CaseGraphData {
  nodes: any[];
  edges: any[];
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

export const casesApi = {
  getCases: async (): Promise<Case[]> => ([]),
  getCase: async (_id: string): Promise<Case> => ({} as Case),
  createCase: async (_name: string, _desc: string): Promise<Case> => ({} as Case),
  getCaseAudit: async (_id: string): Promise<CaseAudit[]> => [],
  getCaseGraph: async (_id: string): Promise<CaseGraphData> => ({ nodes: [], edges: [] }),
  getCaseValidation: async (_id: string): Promise<CaseValidation[]> => [],
  getCaseReports: async (_id: string): Promise<CaseReport[]> => [],
  getCaseEvidence: async (_id: string): Promise<CaseEvidence[]> => [],
  getCaseRecoveries: async (_id: string): Promise<CaseRecovery[]> => [],
  getCaseFiles: async (_id: string): Promise<CaseFile[]> => [],
  getCaseTimeline: async (_id: string): Promise<CaseTimelineEvent[]> => [],
  getCaseFragments: async (_id: string): Promise<CaseFragment[]> => [],
};
