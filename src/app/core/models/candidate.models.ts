export type PipelineStage =
  | 'APPLIED'
  | 'ASSESSMENT_SENT'
  | 'ASSESSMENT_COMPLETED'
  | 'BGC_IN_PROGRESS'
  | 'BGC_PASSED'
  | 'BGC_FAILED'
  | 'OFFER_SENT'
  | 'JOINING_LETTER_SENT'
  | 'JOINED'
  | 'REJECTED';

export type BgcStatus = 'IN_PROGRESS' | 'PASSED' | 'FAILED';

export interface ProjectAllocation {
  projectId: string;
  projectName: string;
  team: string;
  location: Location;
  allocatedAt: string;
}

export interface Location {
  cityId: string;
  city: string;
  officeId: string;
  office: string;
  blockId: string;
  block: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  appliedAt: string;
  pipelineStage: PipelineStage;
  assessmentLink?: string;
  bgcStatus?: BgcStatus;
  assignedTrainingTrack?: string;
  assignedProject?: ProjectAllocation;
  location?: Location;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string;
  isOpen: boolean;
}

export interface ApplicationRequest {
  name: string;
  email: string;
  phone: string;
  resumeFile: File;
}
