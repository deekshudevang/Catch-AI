export interface Fragment {
  id: string;
  case_id: string;
  evidence_id: string;
  recovery_id: string;
  file_candidate_id?: string;
  offset: number;
  physical_offset: number;
  logical_offset?: number;
  length: number;
  cluster?: number;
  filesystem?: string;
  file_type?: string;
  magic_bytes?: string;
  entropy: number;
  sha256?: string;
  source_engine: string;
  byte_histogram?: number[];
  compression_characteristics?: string;
}

export interface FragmentRelationship {
  id: string;
  source_fragment_id: string;
  target_fragment_id: string;
  score: number;
  reasons: string[];
  selected: boolean;
  created_at: string;
}

import { apiFetch, BACKEND_URL } from './client';

export const fragmentsApi = {
  async getFragments(recoveryId?: string, page = 1, limit = 50): Promise<{data: Fragment[], total: number}> {
    let url = `${BACKEND_URL}/api/fragments?page=${page}&limit=${limit}`;
    if (recoveryId) url += `&recovery_id=${recoveryId}`;
    return apiFetch<{data: Fragment[], total: number}>(url);
  },
  async getFragmentById(id: string): Promise<Fragment> {
    return apiFetch<Fragment>(`${BACKEND_URL}/api/fragments/${id}`);
  },
  async getFragmentRelationships(id: string): Promise<FragmentRelationship[]> {
    return apiFetch<FragmentRelationship[]>(`${BACKEND_URL}/api/fragments/${id}/relationships`);
  }
};
