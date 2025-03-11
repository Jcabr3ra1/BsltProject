import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService, RefreshTokenResponse } from '../services/seguridad/auth.service';
import { Router } from '@angular/router';
import { API_CONFIG } from '../config/api.config';

/**
 * Interceptor para agregar el token de autenticación a las solicitudes HTTP
 * y manejar errores de autenticación
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Agregar el token a la solicitud si existe
  const token = authService.getToken();
  
  console.log('AuthInterceptor - Request URL:', req.url);
  console.log('AuthInterceptor - Token exists:', !!token);
  
  // Agregar el token a todas las solicitudes al API Gateway
  // Verificamos si la URL incluye cualquier parte del API Gateway
  if (token && (
      req.url.includes(API_CONFIG.API_GATEWAY_URL) || 
      req.url.includes('localhost:7777') ||
      req.url.includes('/finanzas/') || 
      req.url.includes('/seguridad/')
    )) {
    console.log('AuthInterceptor - Adding token to request for API Gateway');
    req = addToken(req, token);
    
    // Imprimir los headers para depuración
    console.log('AuthInterceptor - Request headers:');
    req.headers.keys().forEach(key => {
      console.log(`${key}: ${req.headers.get(key)}`);
    });
  }

  // Procesar la solicitud y manejar errores
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('AuthInterceptor - Error:', error.status, error.message);
      console.log('AuthInterceptor - Error details:', error);
      
      // Si el error es 401 (Unauthorized), intentar refrescar el token
      if (error.status === 401) {
        console.log('AuthInterceptor - 401 error, attempting to refresh token');
        return handle401Error(req, next, authService, router);
      }
      
      // Si el error es 403 (Forbidden), podría ser un problema con el token
      if (error.status === 403) {
        console.log('AuthInterceptor - 403 error, could be an issue with the token');
        console.log('AuthInterceptor - Request URL that caused 403:', req.url);
        console.log('AuthInterceptor - Request method:', req.method);
        console.log('AuthInterceptor - Request headers:', req.headers);
        
        // Si el mensaje es "Not authenticated", intentar refrescar el token
        if (error.error && error.error.detail === "Not authenticated") {
          console.log('AuthInterceptor - "Not authenticated" error, attempting to refresh token');
          return handle401Error(req, next, authService, router);
        }
      }
      
      return throwError(() => error);
    })
  );
};

/**
 * Agrega el token de autenticación a una solicitud HTTP
 */
function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  console.log('AuthInterceptor - Adding token to request');
  // Asegurarse de que el token no tenga el prefijo "Bearer" duplicado
  const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  
  console.log('AuthInterceptor - Token being added:', tokenValue.substring(0, 15) + '...');
  
  return request.clone({
    setHeaders: {
      Authorization: tokenValue,
      'Content-Type': 'application/json'
    }
  });
}

// Variable para controlar si estamos refrescando el token
let isRefreshing = false;

/**
 * Maneja errores de autenticación (401)
 * Intenta refrescar el token y reintentar la solicitud original
 */
function handle401Error(
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  // Si ya estamos refrescando el token, no lo intentamos de nuevo
  if (isRefreshing) {
    console.log('AuthInterceptor - Already refreshing token, waiting...');
    return next(request);
  }
  
  isRefreshing = true;
  
  // Intentar refrescar el token
  return authService.refreshToken().pipe(
    switchMap(response => {
      console.log('AuthInterceptor - Token refreshed successfully, retrying request');
      isRefreshing = false;
      
      // Clonar la solicitud original con el nuevo token
      const newRequest = addToken(request, response.token);
      
      // Reintentar la solicitud con el nuevo token
      return next(newRequest);
    }),
    catchError(error => {
      console.log('AuthInterceptor - Failed to refresh token:', error);
      isRefreshing = false;
      
      // Si no se pudo refrescar el token, redirigir al login
      authService.logout();
      router.navigate(['/auth/login']);
      
      return throwError(() => error);
    })
  );
}
