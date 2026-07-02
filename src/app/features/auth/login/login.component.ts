import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title class="brand-title">nexHire</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="you@example.com"
                autocomplete="email"
              />
              <mat-icon matSuffix>email</mat-icon>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <mat-error>Please enter a valid email address</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width mt-2">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                autocomplete="current-password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            @if (errorMessage) {
              <p class="error-msg" role="alert">{{ errorMessage }}</p>
            }

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width mt-2 submit-btn"
              [disabled]="form.invalid || loading"
            >
              @if (loading) {
                <mat-spinner diameter="20" />
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-page {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: var(--mat-sys-surface-variant);
      }

      .login-card {
        width: 100%;
        max-width: 420px;
        padding: 16px;
      }

      .brand-title {
        font-size: 28px;
        font-weight: 700;
        color: var(--mat-sys-primary);
      }

      .submit-btn {
        height: 48px;
        font-size: 16px;
      }

      .error-msg {
        color: var(--mat-sys-error);
        font-size: 14px;
        margin: 8px 0 0;
        text-align: center;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = false;
  hidePassword = true;
  errorMessage = '';

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;

    this.auth.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate([this.dashboardRoute(res.role)]);
      },
      error: () => {
        this.loading = false;
        // Generic message — do not reveal which field failed (Requirement 1.2)
        this.errorMessage = 'Invalid credentials. Please try again.';
      },
    });
  }

  private dashboardRoute(role: UserRole): string {
    switch (role) {
      case 'CANDIDATE':
        return '/candidate/dashboard';
      case 'HR':
        return '/hr/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
    }
  }
}
