import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/seguridad/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/auth/login']);
        return false;
      }
      return true;
    })
  );
};
