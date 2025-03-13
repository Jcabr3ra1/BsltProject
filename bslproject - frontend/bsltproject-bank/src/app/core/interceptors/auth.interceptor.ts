import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/seguridad/auth.service';
import { Router } from '@angular/router';
import { API_CONFIG } from '../config/api.config';

// Funciones auxiliares
function isAuthRequest(request: HttpRequest<unknown>): boolean {
  const authEndpoints = [
    `${API_CONFIG.API_GATEWAY_URL}/seguridad/autenticacion/login`,
    `${API_CONFIG.API_GATEWAY_URL}/seguridad/autenticacion/registro`
  ];
  return authEndpoints.some(endpoint => request.url.includes(endpoint));
}

function isApiGatewayRequest(request: HttpRequest<unknown>): boolean {
  return request.url.startsWith(API_CONFIG.API_GATEWAY_URL);
}

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return request.clone({
    setHeaders: {
      Authorization: tokenValue
    }
  });
}

// Interceptor principal
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Agregar Content-Type para todas las solicitudes JSON
  if (!request.headers.has('Content-Type') && !(request.body instanceof FormData)) {
    request = request.clone({
      headers: request.headers.set('Content-Type', 'application/json')
    });
  }

  // Skip token for login and register requests
  if (isAuthRequest(request)) {
    return next(request);
  }

  const token = authService.getToken();
  
  // Add token to all API Gateway requests
  if (token && isApiGatewayRequest(request)) {
    request = addToken(request, token);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Registro detallado del error
      console.error('Interceptor - Error completo:', error);
      console.error('Interceptor - URL:', request.url);
      console.error('Interceptor - Método:', request.method);
      console.error('Interceptor - Headers:', request.headers);
      console.error('Interceptor - Body:', request.body);
      console.error('Interceptor - Status:', error.status);
      console.error('Interceptor - Status Text:', error.statusText);
      console.error('Interceptor - Error:', error.error);
      console.error('Interceptor - Message:', error.message);
      
      // Si hay error 401 (No autorizado) o 403 (Prohibido)
      if (error.status === 401 || error.status === 403) {
        console.error('Interceptor - Error de autenticación, redirigiendo a login');
        authService.logout();
        router.navigate(['/auth/login']);
      }
      
      return throwError(() => error);
    })
  );
};
