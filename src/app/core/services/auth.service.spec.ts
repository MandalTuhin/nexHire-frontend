import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import * as fc from 'fast-check';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models/auth.models';

@Component({ standalone: true, template: '' })
class StubComponent {}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: StubComponent }]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  // Feature: nexhire-frontend, Property 1: JWT is stored on successful login
  // Validates: Requirements 1.1
  it('Property 1 — JWT is stored in sessionStorage after successful login', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.constantFrom('CANDIDATE' as const, 'HR' as const, 'ADMIN' as const),
        fc.uuid(),
        fc.string({ minLength: 2, maxLength: 50 }),
        (token, role, userId, name) => {
          sessionStorage.clear();

          const mockResponse: AuthResponse = { token, role, userId, name };

          service.login({ email: 'test@test.com', password: 'pass' }).subscribe();

          const req = httpMock.expectOne('/api/auth/login');
          req.flush(mockResponse);

          expect(sessionStorage.getItem('nexhire_token')).toBe(token);
          expect(service.getToken()).toBe(token);
          expect(service.currentUser$.value?.token).toBe(token);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: nexhire-frontend, Property 4: Session is cleared on logout
  // Validates: Requirements 1.5
  it('Property 4 — sessionStorage is cleared and token is null after logout', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.constantFrom('CANDIDATE' as const, 'HR' as const, 'ADMIN' as const),
        fc.uuid(),
        fc.string({ minLength: 2, maxLength: 50 }),
        (token, role, userId, name) => {
          // Seed a session as if a login happened
          sessionStorage.setItem('nexhire_token', token);
          sessionStorage.setItem(
            'nexhire_user',
            JSON.stringify({ token, role, userId, name } satisfies AuthResponse),
          );
          service.currentUser$.next({ token, role, userId, name });

          service.logout();

          expect(sessionStorage.getItem('nexhire_token')).toBeNull();
          expect(sessionStorage.getItem('nexhire_user')).toBeNull();
          expect(service.getToken()).toBeNull();
          expect(service.currentUser$.value).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('isLoggedIn() returns false when no token in session', () => {
    sessionStorage.clear();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('getRole() returns null when not logged in', () => {
    sessionStorage.clear();
    service.currentUser$.next(null);
    expect(service.getRole()).toBeNull();
  });
});
