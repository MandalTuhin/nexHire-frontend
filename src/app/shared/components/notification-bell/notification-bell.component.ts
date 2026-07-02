import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatBadgeModule, MatMenuModule],
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="notifMenu"
      [matBadge]="unreadCount > 0 ? unreadCount : null"
      matBadgeColor="warn"
      aria-label="Notifications"
    >
      <mat-icon>notifications</mat-icon>
    </button>

    <mat-menu #notifMenu="matMenu" class="notif-menu">
      @if (notifications.length === 0) {
        <div class="notif-empty">No notifications</div>
      }
      @for (n of notifications; track n.id) {
        <button mat-menu-item (click)="markRead(n.id)" [class.unread]="!n.isRead">
          <span>{{ n.message }}</span>
          <span class="notif-time">{{ n.createdAt | date: 'short' }}</span>
        </button>
      }
    </mat-menu>
  `,
  styles: [
    `
      .notif-empty {
        padding: 16px;
        color: #888;
        font-size: 14px;
      }
      .unread {
        font-weight: 600;
        background: #f0f4ff;
      }
      .notif-time {
        display: block;
        font-size: 11px;
        color: #999;
      }
    `,
  ],
})
export class NotificationBellComponent implements OnInit {
  private readonly notifService = inject(NotificationService);

  notifications = this.notifService.notifications$.value;
  unreadCount = 0;

  ngOnInit(): void {
    this.notifService.notifications$.subscribe((notifs) => {
      this.notifications = notifs;
      this.unreadCount = notifs.filter((n) => !n.isRead).length;
    });
    this.notifService.fetchNotifications();
  }

  markRead(id: string): void {
    this.notifService.markAsRead(id);
  }
}
