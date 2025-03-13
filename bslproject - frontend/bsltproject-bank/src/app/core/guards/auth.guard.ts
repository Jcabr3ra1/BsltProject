import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take, catchError, of, switchMap } from 'rxjs';
import { AuthService } from '../services/seguridad/auth.service';

// Enhanced version with better error handling and logging
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    switchMap(isAuthenticated => {
      console.log('AuthGuard - Checking authentication state...');
      console.log('AuthGuard - Is authenticated:', isAuthenticated);

      if (!isAuthenticated) {
        console.log('AuthGuard - User not authenticated, redirecting to login');
        router.navigate(['/auth/login']);
        return of(false);
      }

      return of(true);
    }),
    catchError(error => {
      console.error('AuthGuard - Error:', error);
      router.navigate(['/auth/login']);
      return of(false);
    })
  );
};
