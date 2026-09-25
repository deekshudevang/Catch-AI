export interface RecoveryJob {
  id: string;
  evidence_id: string;
  case_id: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  files_found: number;
  deleted_files: number;
  recoverable: number;
  recovered: number;
  partial: number;
  fragments: number;
  reconstructions: number;
  validation_failures: number;
}

export interface EngineExecution {
  id: string;
  recovery_id: string;
  engine: string;
  operation: string;
  status: 'USED' | 'NOT_REQUIRED' | 'FAILED' | 'PENDING';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  output?: string;
  error?: string;
}

export interface PipelineStep {
  name: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  started_at?: string;
  duration_ms?: number;
  result_count?: number;
}

import { apiFetch, BACKEND_URL } from './client';

export const recoveryApi = {
  async getRecoveryJob(id: string): Promise<RecoveryJob> {
    return apiFetch<RecoveryJob>(`${BACKEND_URL}/api/recoveries/${id}`);
  },
  async getEngineExecutions(recoveryId: string): Promise<EngineExecution[]> {
    return apiFetch<EngineExecution[]>(`${BACKEND_URL}/api/recoveries/${recoveryId}/executions`);
  },
  async getPipelineStatus(recoveryId: string): Promise<PipelineStep[]> {
    return apiFetch<PipelineStep[]>(`${BACKEND_URL}/api/recoveries/${recoveryId}/pipeline`);
  }
};
