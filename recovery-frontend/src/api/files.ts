export interface RecoveredFile {
  id: string;
  recovery_id: string;
  filename: string;
  detected_type: string;
  extension?: string;
  size_bytes: number;
  recovery_method: string;
  source_engine: string;
  fragments_count: number;
  integrity_score: number;
  confidence_score: number;
  status: 'RECOVERED' | 'PARTIAL' | 'FAILED' | 'CORRUPT';
  sha256?: string;
}

import { apiFetch, BACKEND_URL } from './client';

export const filesApi = {
  async getFiles(recoveryId?: string): Promise<RecoveredFile[]> {
    const url = recoveryId ? `${BACKEND_URL}/api/files?recovery_id=${recoveryId}` : `${BACKEND_URL}/api/files`;
    return apiFetch<RecoveredFile[]>(url);
  },
  async getFileById(id: string): Promise<RecoveredFile> {
    return apiFetch<RecoveredFile>(`${BACKEND_URL}/api/files/${id}`);
  },
  async validateFile(id: string): Promise<void> {
    await apiFetch(`${BACKEND_URL}/api/files/${id}/validate`, { method: 'POST' });
  },
  async hashFile(id: string): Promise<string> {
    const res = await apiFetch<{ hash: string }>(`${BACKEND_URL}/api/files/${id}/hash`, { method: 'POST' });
    return res.hash;
  }
};
