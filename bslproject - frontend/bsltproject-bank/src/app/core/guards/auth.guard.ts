import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '@core/services/seguridad/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.verifyToken().pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        console.log('AuthGuard - Usuario no autenticado, redirigiendo a login');
        router.navigate(['/auth/login']);
        return false;
      }
      console.log('AuthGuard - Usuario autenticado, permitiendo acceso');
      return true;
    }),
    catchError(error => {
      console.error('AuthGuard - Error:', error);
      router.navigate(['/auth/login']);
      return of(false);
    })
  );
};