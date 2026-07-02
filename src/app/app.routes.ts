import { Routes } from '@angular/router';

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
    path: 'candidate',
    loadChildren: () =>
      import('./features/candidate/candidate.routes').then((m) => m.candidateRoutes),
  },
  {
    path: 'hr',
    loadChildren: () => import('./features/hr/hr.routes').then((m) => m.hrRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
