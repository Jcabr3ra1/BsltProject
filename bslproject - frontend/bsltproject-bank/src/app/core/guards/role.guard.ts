import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(requiredRole: string): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.getUser();

    if (user?.roles?.includes(requiredRole)) {
      return true;
    }

    router.navigate(['/auth/login']);
    return false;
  };
}
