import { Location } from './candidate.models';

export interface Project {
  id: string;
  name: string;
  team: string;
  location: Location;
}

export type SwitchRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProjectSwitchRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  currentProjectId: string;
  currentProjectName: string;
  targetProjectId: string;
  targetProjectName: string;
  reason: string;
  status: SwitchRequestStatus;
  submittedAt: string;
  resolvedAt?: string;
  rejectionReason?: string;
}
