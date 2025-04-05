import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Interceptor funcional para manejar errores HTTP de manera centralizada.
 * Muestra mensajes de error apropiados al usuario según el tipo de error.
 * 
 * Este interceptor se ejecuta después del authInterceptor, por lo que los errores
 * de autenticación (401) y autorización (403) ya han sido manejados.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // No mostrar errores 401/403 aquí ya que son manejados por authInterceptor
      if (error.status !== 401 && error.status !== 403) {
        showErrorMessage(error, snackBar);
      }
      
      return throwError(() => error);
    })
  );
};

/**
 * Muestra un mensaje de error apropiado según el tipo de error HTTP
 * @param error Error HTTP recibido
 * @param snackBar Servicio para mostrar notificaciones
 */
function showErrorMessage(error: HttpErrorResponse, snackBar: MatSnackBar): void {
  let message: string;
  let panelClass = ['error-snackbar'];
  
  switch (error.status) {
    case 0:
      message = 'No se pudo conectar al servidor. Verifique su conexión a internet.';
      break;
    case 400:
      message = `Error: ${error.error?.error || error.error?.message || 'Solicitud incorrecta'}`;
      break;
    case 404:
      message = 'Recurso no encontrado';
      break;
    case 500:
      message = 'Error interno del servidor';
      break;
    default:
      message = `Error: ${error.message || 'Ocurrió un error inesperado'}`;
  }
  
  snackBar.open(message, 'Cerrar', {
    duration: 5000,
    panelClass
  });
}