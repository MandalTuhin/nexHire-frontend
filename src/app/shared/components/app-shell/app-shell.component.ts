import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { UserRole } from '../../../core/models/auth.models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  // Candidate routes
  { label: 'Dashboard', icon: 'dashboard', route: '/candidate/dashboard', roles: ['CANDIDATE'] },
  { label: 'My Application', icon: 'description', route: '/candidate/apply', roles: ['CANDIDATE'] },
  { label: 'My Status', icon: 'timeline', route: '/candidate/status', roles: ['CANDIDATE'] },
  { label: 'Switch Project', icon: 'swap_horiz', route: '/candidate/switch', roles: ['CANDIDATE'] },

  // HR routes
  { label: 'Dashboard', icon: 'dashboard', route: '/hr/dashboard', roles: ['HR'] },
  { label: 'Candidates', icon: 'people', route: '/hr/candidates', roles: ['HR'] },
  { label: 'Budget', icon: 'account_balance_wallet', route: '/hr/budget', roles: ['HR'] },
  { label: 'Allocations', icon: 'assignment', route: '/hr/allocations', roles: ['HR'] },
  {
    label: 'Project Switches',
    icon: 'compare_arrows',
    route: '/hr/project-switches',
    roles: ['HR'],
  },

  // Admin routes
  { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard', roles: ['ADMIN'] },
  { label: 'Users', icon: 'manage_accounts', route: '/admin/users', roles: ['ADMIN'] },
  { label: 'Assets', icon: 'devices', route: '/admin/assets', roles: ['ADMIN'] },
  { label: 'Budget Allocation', icon: 'payments', route: '/admin/budget', roles: ['ADMIN'] },
  { label: 'Locations', icon: 'location_on', route: '/admin/locations', roles: ['ADMIN'] },
  { label: 'Audit Log', icon: 'history', route: '/admin/audit', roles: ['ADMIN'] },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    NotificationBellComponent,
  ],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <span class="brand">nexHire</span>
          <span class="user-name">{{ userName }}</span>
          <span class="user-role">{{ userRole }}</span>
        </div>
        <mat-divider />
        <mat-nav-list>
          @for (item of visibleNavItems; track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
        <div class="sidenav-footer">
          <mat-divider />
          <button mat-button class="logout-btn" (click)="logout()">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <span class="spacer"></span>
          <app-notification-bell />
        </mat-toolbar>
        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .shell-container {
        height: 100vh;
      }

      .sidenav {
        width: 240px;
        display: flex;
        flex-direction: column;
      }

      .sidenav-header {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .brand {
        font-size: 20px;
        font-weight: 700;
        color: var(--mat-sys-primary);
      }

      .user-name {
        font-size: 14px;
        font-weight: 500;
      }

      .user-role {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .sidenav-footer {
        margin-top: auto;
        padding: 8px;
      }

      .logout-btn {
        width: 100%;
        justify-content: flex-start;
        gap: 8px;
      }

      .active-link {
        background-color: var(--mat-sys-secondary-container);
      }

      .toolbar {
        position: sticky;
        top: 0;
        z-index: 1;
      }
      .spacer {
        flex: 1 1 auto;
      }

      .content {
        padding: 24px;
        min-height: calc(100vh - 64px);
      }
    `,
  ],
})
export class AppShellComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  visibleNavItems: NavItem[] = [];
  userName = '';
  userRole: UserRole | null = null;

  ngOnInit(): void {
    const user = this.auth.currentUser$.value;
    this.userName = user?.name ?? '';
    this.userRole = user?.role ?? null;
    this.visibleNavItems = NAV_ITEMS.filter(
      (item) => this.userRole && item.roles.includes(this.userRole),
    );
  }

  logout(): void {
    this.auth.logout();
  }
}
