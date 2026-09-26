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

export const graphApi = {
  get: async (_jobId: string): Promise<GraphData> => ({ nodes: [], edges: [] }),
  getGraph: async (_jobId?: string, _param2?: any, _param3?: any): Promise<GraphData> => ({ nodes: [], edges: [] }),
  getProbablePaths: async (_jobId?: string): Promise<ReconstructionPath[]> => [],
};
