import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '@core/services/seguridad/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.verifyToken().pipe(
      map(isAuthenticated => {
        console.log('AuthGuard - Is authenticated:', isAuthenticated);
        if (!isAuthenticated) {
          console.log('Usuario no autenticado, redirigiendo a login');
          this.router.navigate(['/autenticacion/login']);
          return false;
        }
        return true;
      }),
      catchError(error => {
        console.error('Error en authGuard:', error);
        this.router.navigate(['/autenticacion/login']);
        return of(false);
      })
    );
  }
}
