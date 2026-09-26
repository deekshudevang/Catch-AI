import { backendApi } from './client';
import type { RecoveryJob as BaseRecoveryJob } from './client';

export interface RecoveryJob extends BaseRecoveryJob {
  case_id: string;
  evidence_id: string;
  recovered: number;
  files_found: number;
  deleted_files: number;
  recoverable: number;
  partial: number;
  reconstructions: number;
  fragments: number;
}

export interface EngineExecution {
  name: string;
  status: string;
  duration: number;
  id: string;
  engine: string;
  operation: string;
}

export const recoveryApi = {
  ...backendApi,
  engines: async (_id: string): Promise<{ engines: EngineExecution[] }> => ({ engines: [] }),
  getRecoveryJob: async (_id: string): Promise<RecoveryJob> => ({} as RecoveryJob),
  getEngineExecutions: async (_id: string): Promise<EngineExecution[]> => [],
};
