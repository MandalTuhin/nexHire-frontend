import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Notification } from '../models/notification.models';
import { AuthService } from './auth.service';

const API_BASE = '/api';

// Mock notifications for development — remove once real API is wired
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    userId: '',
    message: 'Your BGC check has been initiated.',
    isRead: false,
    createdAt: new Date().toISOString(),
    relatedEntityType: 'BGC',
  },
  {
    id: '2',
    userId: '',
    message: 'Assessment link has been sent to you.',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    relatedEntityType: 'ASSESSMENT',
  },
];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  readonly notifications$ = new BehaviorSubject<Notification[]>([]);

  fetchNotifications(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;

    // TODO: replace with real API call once endpoints are available
    // this.http.get<Notification[]>(`${API_BASE}/notifications/${userId}`)
    //   .subscribe(n => this.notifications$.next(n));

    // Mock: seed with sample notifications
    this.notifications$.next(MOCK_NOTIFICATIONS.map((n) => ({ ...n, userId })));
  }

  markAsRead(id: string): void {
    const updated = this.notifications$.value.map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    );
    this.notifications$.next(updated);

    // TODO: also call PATCH /api/notifications/:id once API is wired
  }

  /** Used by other services to push a new notification locally */
  push(notification: Notification): void {
    this.notifications$.next([notification, ...this.notifications$.value]);
  }
}
