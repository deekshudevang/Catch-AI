export interface Fragment {
  id: string;
  offset: number;
  size: number;
  entropy: number;
  type: string;
  length: number;
  file_type: string;
  source_engine: string;
}

export const fragmentsApi = {
  list: async (_jobId?: string): Promise<{ fragments: Fragment[] }> => ({ fragments: [] }),
  get: async (_id: string): Promise<Fragment> => ({} as Fragment),
  getFragments: async (_jobId?: string): Promise<Fragment[]> => [],
};
