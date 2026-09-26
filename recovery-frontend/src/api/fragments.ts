import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export interface Fragment {
  id: string;
  offset: number | string;
  size: number | string;
  entropy: number;
  type: string;
  length?: number;
  file_type?: string;
  source_engine?: string;
  conf?: string;
  status?: string;
}

export const fragmentsApi = {
  list: async (jobId?: string): Promise<{ fragments: Fragment[] }> => {
    if (!jobId) return { fragments: [] };
    try {
      const response = await axios.get(`${API_BASE}/recoveries/${jobId}/fragments`);
      return { fragments: response.data };
    } catch (e) {
      console.error(e);
      return { fragments: [] };
    }
  },
  get: async (_id: string): Promise<Fragment> => ({} as Fragment),
  getFragments: async (jobId?: string): Promise<Fragment[]> => {
    if (!jobId) return [];
    try {
      const response = await axios.get(`${API_BASE}/recoveries/${jobId}/fragments`);
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
};
