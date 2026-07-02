import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, UserRole } from '../models/auth.models';

const TOKEN_KEY = 'nexhire_token';
const USER_KEY = 'nexhire_user';

// Mock API URL — replace with real base URL once API docs arrive
const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser$ = new BehaviorSubject<AuthResponse | null>(this.loadUserFromSession());

  // ── Public API ────────────────────────────────────────────────────────────

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE}/auth/login`, req)
      .pipe(tap((res) => this.persistSession(res)));
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.currentUser$.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  getRole(): UserRole | null {
    return this.currentUser$.value?.role ?? null;
  }

  getUserId(): string | null {
    return this.currentUser$.value?.userId ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private persistSession(res: AuthResponse): void {
    sessionStorage.setItem(TOKEN_KEY, res.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(res));
    this.currentUser$.next(res);
  }

  private loadUserFromSession(): AuthResponse | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch {
      return null;
    }
  }
}
