import { HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Interceptor funcional para Angular que añade el token de autenticación a las solicitudes
 * y maneja errores de autenticación. Este interceptor sigue el nuevo enfoque funcional
 * de Angular para interceptores HTTP.
 *
 * Funcionalidades:
 * - Añade el token de autenticación a todas las solicitudes excepto login y registro
 * - Maneja errores 401 (No autorizado) redirigiendo al login
 * - Maneja errores 403 (Prohibido) mostrando mensaje de error
 * - Asegura que el token tenga el formato correcto con el prefijo "Bearer"
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  
  // Omitir autenticación si el encabezado Skip-Auth está presente o si es una solicitud de login/registro
  if (req.headers.has('Skip-Auth') || 
      req.url.includes('/autenticacion/login') || 
      req.url.includes('/autenticacion/registro')) {
    return next(req);
  }
  
  // Obtener token del localStorage directamente ya que no tenemos acceso a AuthService en un interceptor funcional
  const token = localStorage.getItem('token');
  
  // Añadir token a TODAS las solicitudes, no solo a las específicas
  if (token) {
    // Asegurarse de que el token tenga el formato correcto con el prefijo "Bearer "
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    // Crear una nueva solicitud con el encabezado de autorización
    const authReq = req.clone({
      setHeaders: {
        Authorization: formattedToken,
        'Content-Type': 'application/json'
      }
    });
    
    return next(authReq).pipe(
      catchError((error) => {
        // Manejar errores 401 (No autorizado)
        if (error.status === 401) {
          // Limpiar tokens y redirigir al login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          snackBar.open('Sesión expirada. Por favor inicie sesión nuevamente.', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          
          // No podemos inyectar Router en un interceptor funcional, así que usamos window.location
          window.location.href = '/auth/login';
        } else if (error.status === 403) {
          snackBar.open('No tiene permisos para realizar esta acción', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
        
        return throwError(() => error);
      })
    );
  }
  
  // Si no se encuentra token, continuar con la solicitud original
  return next(req);
};