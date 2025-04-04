import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

/**
 * Interceptor funcional para manejar errores relacionados con la autenticación
 */
export const userIdInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  
  // Continuar con la solicitud y procesar la respuesta
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 (No autorizado) o 403 (Prohibido), redirigir al login
      if (error.status === 401 || error.status === 403) {
        console.error('Interceptor: Error de autenticación:', error.status);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        router.navigate(['/auth/login']);
      }
      
      return throwError(() => error);
    })
  );
};
