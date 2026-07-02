import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import * as fc from 'fast-check';
import { AppShellComponent } from './app-shell.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/auth.models';

// Routes whose labels are exclusively for a given role
const CANDIDATE_LABELS = ['My Application', 'My Status', 'Switch Project'];
const HR_LABELS = ['Candidates', 'Budget', 'Allocations', 'Project Switches'];
const ADMIN_LABELS = ['Users', 'Assets', 'Budget Allocation', 'Locations', 'Audit Log'];

const ROLE_EXCLUSIVE: Record<UserRole, string[]> = {
  CANDIDATE: CANDIDATE_LABELS,
  HR: HR_LABELS,
  ADMIN: ADMIN_LABELS,
};

describe('AppShellComponent — role-based navigation', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideAnimations(),
      ],
    });
  });

  afterEach(() => sessionStorage.clear());

  // Feature: nexhire-frontend, Property 7: Navigation renders only role-permitted items
  // Validates: Requirements 2.4
  it('Property 7 — nav items for other roles are absent from the visible list', () => {
    fc.assert(
      fc.property(fc.constantFrom<UserRole>('CANDIDATE', 'HR', 'ADMIN'), (userRole) => {
        const authService = TestBed.inject(AuthService);
        sessionStorage.setItem('nexhire_token', 'tok');
        authService.currentUser$.next({
          token: 'tok',
          role: userRole,
          userId: '1',
          name: 'Test User',
        });

        const fixture = TestBed.createComponent(AppShellComponent);
        fixture.detectChanges();
        const comp = fixture.componentInstance;

        const visibleLabels = comp.visibleNavItems.map((i) => i.label);

        // Items exclusive to other roles must NOT appear
        const otherRoles = (['CANDIDATE', 'HR', 'ADMIN'] as UserRole[]).filter(
          (r) => r !== userRole,
        );
        for (const otherRole of otherRoles) {
          for (const exclusiveLabel of ROLE_EXCLUSIVE[otherRole]) {
            expect(visibleLabels).not.toContain(exclusiveLabel);
          }
        }

        // At least the Dashboard item for this role must appear
        expect(visibleLabels).toContain('Dashboard');
      }),
      { numRuns: 100 },
    );
  });
});
