export type AuditStatus = 'DRAFT' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
export type CheckStatus = 'PENDING' | 'QUEUED' | 'RUNNING' | 'OK' | 'KO';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Check {
  id: string;
  title: string;
  priority: Priority;
  status: CheckStatus;
  evidence?: string;
  reviewed: boolean;
  updatedAt: string;
}

export interface Audit {
  id: string;
  name: string;
  process: string;
  status: AuditStatus;
  progress: number;
  owner: { id: string; name: string };
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  templateId: string;
  checks: Check[];
}