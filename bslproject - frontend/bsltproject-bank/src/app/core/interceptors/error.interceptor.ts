import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  
  return next(req).pipe(
    catchError(error => {
      console.error('Error interceptado:', error);
      
      if (error.status === 0) {
        snackBar.open('No se pudo conectar al servidor. Verifique su conexión a internet.', 'Cerrar', {
          duration: 5000
        });
      } else if (error.status === 400) {
        const message = error.error?.error || error.error?.message || 'Solicitud incorrecta';
        snackBar.open(`Error: ${message}`, 'Cerrar', {
          duration: 5000
        });
      } else if (error.status === 401) {
        snackBar.open('Sesión expirada. Por favor inicie sesión nuevamente.', 'Cerrar', {
          duration: 5000
        });
      } else if (error.status === 403) {
        snackBar.open('No tiene permisos para realizar esta acción', 'Cerrar', {
          duration: 5000
        });
      } else if (error.status === 404) {
        snackBar.open('Recurso no encontrado', 'Cerrar', {
          duration: 5000
        });
      } else if (error.status === 500) {
        snackBar.open('Error interno del servidor', 'Cerrar', {
          duration: 5000
        });
      } else {
        snackBar.open(`Error: ${error.message || 'Ocurrió un error inesperado'}`, 'Cerrar', {
          duration: 5000
        });
      }
      
      return throwError(() => error);
    })
  );
};