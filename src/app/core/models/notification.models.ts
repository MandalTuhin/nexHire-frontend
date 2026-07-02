export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actionType: string;
  entityType: string;
  entityId: string;
  description: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CANDIDATE' | 'HR' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}
