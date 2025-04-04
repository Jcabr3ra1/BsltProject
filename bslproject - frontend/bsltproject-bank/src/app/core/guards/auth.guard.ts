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
    console.log('AuthGuard - Verificando acceso...');
    
    // Primero comprobar si hay token
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No hay token, redirigiendo a login');
      this.router.navigate(['/auth/login']);
      return of(false);
    }
    
    // Verificar token en el servidor
    return this.authService.verifyToken().pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          console.log('Token inválido, redirigiendo a login');
          this.router.navigate(['/auth/login']);
          return false;
        }
        return true;
      }),
      catchError(error => {
        console.error('Error en authGuard:', error);
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}