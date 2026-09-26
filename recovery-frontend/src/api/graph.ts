export interface GraphNode {
  id: string;
  label: string;
  type: string;
  offset: number;
  length: number;
  entropy: number;
  source_engine: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  id: string;
  score: number;
  reasons: string[];
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ReconstructionPath {
  id: string;
  score: number;
  fragment_count: number;
  fragments: any[];
}

const API_URL = 'http://localhost:8000';

export const graphApi = {
  get: async (jobId: string): Promise<GraphData> => {
    const res = await fetch(`${API_URL}/api/recoveries/${jobId}/graph`);
    return res.json();
  },
  getGraph: async (jobId?: string, param2?: any, param3?: any): Promise<GraphData> => {
    const id = param3 || param2 || jobId;
    if (!id) return { nodes: [], edges: [] };
    const res = await fetch(`${API_URL}/api/recoveries/${id}/graph`);
    return res.json();
  },
  getProbablePaths: async (jobId?: string): Promise<ReconstructionPath[]> => {
    if (!jobId) return [];
    const res = await fetch(`${API_URL}/api/recoveries/${jobId}/paths`);
    return res.json();
  },
};
