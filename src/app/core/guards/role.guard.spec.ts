import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import * as fc from 'fast-check';
import { roleGuard } from './role.guard';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.models';

@Component({ standalone: true, template: '' })
class StubComponent {}

const ALL_ROLES: UserRole[] = ['CANDIDATE', 'HR', 'ADMIN'];

function runGuard(route: ActivatedRouteSnapshot): boolean | UrlTree {
  return TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot)) as
    boolean | UrlTree;
}

function runAuthGuard(): boolean | UrlTree {
  return TestBed.runInInjectionContext(() =>
    authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  ) as boolean | UrlTree;
}

function makeRoute(roles: UserRole[]): ActivatedRouteSnapshot {
  const route = new ActivatedRouteSnapshot();
  (route as any).data = { roles };
  return route;
}

describe('roleGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', component: StubComponent },
          { path: 'candidate/dashboard', component: StubComponent },
          { path: 'hr/dashboard', component: StubComponent },
          { path: 'admin/dashboard', component: StubComponent },
        ]),
      ],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => sessionStorage.clear());

  // Feature: nexhire-frontend, Property 3: Role guard redirects unauthorized routes
  // Validates: Requirements 1.4
  it('Property 3 — guard returns true only when user role is in the allowed list, redirects otherwise', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_ROLES),
        fc.subarray(ALL_ROLES, { minLength: 0, maxLength: 3 }),
        (userRole, allowedRoles) => {
          // Set up logged-in user with the given role
          authService.currentUser$.next({
            token: 'mock-token',
            role: userRole,
            userId: '1',
            name: 'Test',
          });
          sessionStorage.setItem('nexhire_token', 'mock-token');

          const route = makeRoute(allowedRoles);
          const result = runGuard(route);

          if (allowedRoles.includes(userRole)) {
            expect(result).toBe(true);
          } else {
            // Should redirect — result must be a UrlTree (not true)
            expect(result instanceof UrlTree).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('redirects to /login when no role (unauthenticated)', () => {
    authService.currentUser$.next(null);
    sessionStorage.clear();

    const route = makeRoute(['HR']);
    const result = runGuard(route);

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: StubComponent }]),
      ],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => sessionStorage.clear());

  it('allows access when token exists', () => {
    sessionStorage.setItem('nexhire_token', 'valid-token');
    expect(runAuthGuard()).toBe(true);
  });

  it('redirects to /login when no token', () => {
    sessionStorage.clear();
    const result = runAuthGuard();
    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});
