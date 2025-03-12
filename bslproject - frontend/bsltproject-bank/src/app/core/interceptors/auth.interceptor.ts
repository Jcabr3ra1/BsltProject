import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/seguridad/auth.service';
import { LoginResponse } from '../models/seguridad/usuario.model';
import { Router } from '@angular/router';
import { API_CONFIG } from '../config/api.config';

/**
 * Interceptor para agregar el token de autenticación a las solicitudes HTTP
 * y manejar errores de autenticación
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    
    console.log('AuthInterceptor - Request URL:', request.url);
    console.log('AuthInterceptor - Token exists:', !!token);
    console.log('AuthInterceptor - Full token:', token);
    console.log('AuthInterceptor - Original headers:', request.headers);

    // Agregar el token a todas las solicitudes al API Gateway
    if (token && (
      request.url.includes(API_CONFIG.API_GATEWAY_URL) || 
      request.url.includes('localhost:7777') ||
      request.url.includes('/finanzas/') || 
      request.url.includes('/seguridad/')
    )) {
      console.log('AuthInterceptor - Adding token to request for API Gateway');
      request = this.addToken(request, token);
      
      // Imprimir los headers para depuración
      console.log('AuthInterceptor - Modified headers:');
      request.headers.keys().forEach(key => {
        console.log(`${key}: ${request.headers.get(key)}`);
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('AuthInterceptor - Error:', error.status, error.message);
        console.log('AuthInterceptor - Error details:', error);
        
        // Si el error es 401 (Unauthorized), intentar refrescar el token
        if (error.status === 401) {
          console.log('AuthInterceptor - 401 error, attempting to refresh token');
          return this.handle401Error(request, next);
        }
        
        // Si el error es 403 (Forbidden), podría ser un problema con el token
        if (error.status === 403) {
          console.log('AuthInterceptor - 403 error, could be an issue with the token');
          console.log('AuthInterceptor - Request URL that caused 403:', request.url);
          console.log('AuthInterceptor - Request method:', request.method);
          console.log('AuthInterceptor - Request headers:', request.headers);
          
          // Verificar si el token está presente y es válido
          const token = this.authService.getToken();
          if (!token) {
            console.log('AuthInterceptor - No token found, redirecting to login');
            this.authService.logout();
            this.router.navigate(['/auth/login']);
            return throwError(() => error);
          }

          // Intentar refrescar el token y reintentar la solicitud
          return this.handle401Error(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    console.log('AuthInterceptor - Agregando token a la solicitud');

    const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    console.log('AuthInterceptor - Token agregado:', tokenValue.substring(0, 15) + '...');
    
    return request.clone({
      setHeaders: {
        Authorization: tokenValue,
        'Content-Type': 'application/json'
      }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Variable para controlar si estamos refrescando el token
    let isRefreshing = false;

    // Si ya estamos refrescando el token, no lo intentamos de nuevo
    if (isRefreshing) {
      console.log('AuthInterceptor - Already refreshing token, waiting...');
      return next.handle(request);
    }
    
    isRefreshing = true;
    
    // Intentar refrescar el token
    return this.authService.refreshToken().pipe(
      switchMap((response: LoginResponse) => {
        console.log('AuthInterceptor - Token refreshed successfully, retrying request');
        isRefreshing = false;
        
        // Clonar la solicitud original con el nuevo token
        const newRequest = this.addToken(request, response.token);
        
        // Reintentar la solicitud con el nuevo token
        return next.handle(newRequest);
      }),
      catchError((error) => {
        console.log('AuthInterceptor - Failed to refresh token:', error);
        isRefreshing = false;
        
        // Si no se pudo refrescar el token, redirigir al login
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        
        return throwError(() => error);
      })
    );
  }
}
