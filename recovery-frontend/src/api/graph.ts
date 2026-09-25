export interface GraphNode {
  id: string;
  fragment_id: string;
  offset: number;
  length: number;
  type: string;
  entropy: number;
  source_engine: string;
}

export interface GraphEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  score: number;
  reasons: string[];
  is_selected_path: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ReconstructionPath {
  path_id: string;
  score: number;
  fragment_count: number;
  fragments: string[]; // ordered fragment IDs
  reasons: string[];
}

import { apiFetch, BACKEND_URL } from './client';

export const graphApi = {
  async getGraph(caseId?: string, evidenceId?: string, recoveryId?: string, minScore = 0.5): Promise<GraphData> {
    const params = new URLSearchParams({ min_score: minScore.toString() });
    if (caseId) params.append('case_id', caseId);
    if (evidenceId) params.append('evidence_id', evidenceId);
    if (recoveryId) params.append('recovery_id', recoveryId);
    return apiFetch<GraphData>(`${BACKEND_URL}/api/graph?${params.toString()}`);
  },
  async getProbablePaths(recoveryId: string): Promise<ReconstructionPath[]> {
    return apiFetch<ReconstructionPath[]>(`${BACKEND_URL}/api/graph/paths?recovery_id=${recoveryId}`);
  }
};
