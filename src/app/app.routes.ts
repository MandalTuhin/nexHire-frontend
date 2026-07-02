import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    // Authenticated shell — wraps all feature routes with sidenav layout
    path: '',
    loadComponent: () =>
      import('./shared/components/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'candidate',
        data: { roles: ['CANDIDATE'] },
        canActivate: [roleGuard],
        loadChildren: () =>
          import('./features/candidate/candidate.routes').then((m) => m.candidateRoutes),
      },
      {
        path: 'hr',
        data: { roles: ['HR'] },
        canActivate: [roleGuard],
        loadChildren: () => import('./features/hr/hr.routes').then((m) => m.hrRoutes),
      },
      {
        path: 'admin',
        data: { roles: ['ADMIN'] },
        canActivate: [roleGuard],
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
