import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.models';

/** Redirects to the user's own dashboard if their role is not in the allowed list */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedRoles: UserRole[] = route.data['roles'] ?? [];
  const userRole = auth.getRole();

  if (!userRole) {
    return router.createUrlTree(['/login']);
  }

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  // Redirect to the appropriate dashboard for this role
  return router.createUrlTree([roleDashboard(userRole)]);
};

function roleDashboard(role: UserRole): string {
  switch (role) {
    case 'CANDIDATE':
      return '/candidate/dashboard';
    case 'HR':
      return '/hr/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
  }
}
