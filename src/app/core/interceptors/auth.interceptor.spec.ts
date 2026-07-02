import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import * as fc from 'fast-check';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

@Component({ standalone: true, template: '' })
class StubComponent {}

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: StubComponent }]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  // Feature: nexhire-frontend, Property 2: Session is cleared on 401 response
  // Validates: Requirements 1.3
  it('Property 2 — session is cleared and token is null when any request receives a 401', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 10, maxLength: 100 }), fc.webUrl(), (token, url) => {
        // Seed a valid session
        sessionStorage.setItem('nexhire_token', token);
        sessionStorage.setItem(
          'nexhire_user',
          JSON.stringify({ token, role: 'HR', userId: '1', name: 'Test HR' }),
        );
        authService.currentUser$.next({ token, role: 'HR', userId: '1', name: 'Test HR' });

        // Make a request
        http.get(url).subscribe({ error: () => {} });

        // Flush a 401 response
        const req = httpMock.expectOne(url);
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        // Session must be cleared
        expect(sessionStorage.getItem('nexhire_token')).toBeNull();
        expect(authService.getToken()).toBeNull();
        expect(authService.currentUser$.value).toBeNull();
      }),
      { numRuns: 50 },
    );
  });

  it('attaches Authorization header when a token is present', () => {
    sessionStorage.setItem('nexhire_token', 'test-token-123');
    authService.currentUser$.next({ token: 'test-token-123', role: 'HR', userId: '1', name: 'HR' });

    http.get('/api/candidates').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/candidates');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    req.flush([]);
  });

  it('does not attach Authorization header when no token exists', () => {
    sessionStorage.clear();
    authService.currentUser$.next(null);

    http.get('/api/jobs').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/jobs');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush([]);
  });
});
