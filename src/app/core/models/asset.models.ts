export type AssetStatus = 'AVAILABLE' | 'IN_USE' | 'UNDER_MAINTENANCE';

export interface Asset {
  id: string;
  assetType: string;
  assetTag: string;
  status: AssetStatus;
  assignedToId?: string;
  assignedToName?: string;
  assignedAt?: string;
}
