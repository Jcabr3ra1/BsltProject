import { HttpInterceptorFn} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Functional interceptor for Angular 16+ to add authentication token to requests
 * and handle authentication errors
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('AuthInterceptor - Request URL:', req.url);
  
  // Skip authentication if the Skip-Auth header is present or if it's a login/register request
  if (req.headers.has('Skip-Auth') || 
      req.url.includes('/autenticacion/login') || 
      req.url.includes('/autenticacion/registro')) {
    console.log('AuthInterceptor - Skipping token for auth endpoint:', req.url);
    return next(req);
  }
  
  // Get token from localStorage directly since we don't have access to AuthService in a functional interceptor
  const token = localStorage.getItem('token');
  console.log('AuthInterceptor - Token exists:', !!token);
  
  // Add token to ALL requests, not just specific ones
  if (token) {
    console.log('AuthInterceptor - Adding token to request');
    
    // Asegurarse de que el token tenga el formato correcto con el prefijo "Bearer "
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    // Create a new request with the Authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: formattedToken,
        'Content-Type': 'application/json'
      }
    });
    
    return next(authReq).pipe(
      catchError((error) => {
        console.log('AuthInterceptor - Error:', error.status, error.message);
        
        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          console.log('AuthInterceptor - 401 error, redirecting to login');
          // Clear tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // We can't inject Router in a functional interceptor, so use window.location
          window.location.href = '/auth/login';
        } else if (error.status === 403) {
          console.log('AuthInterceptor - 403 error, posible problema de permisos');
          console.error('Acceso prohibido. No tiene permisos para realizar esta acción.');
        }
        
        return throwError(() => error);
      })
    );
  }
  
  // If no token is found, proceed with the original request
  console.warn('AuthInterceptor - No token found, proceeding without authorization');
  return next(req);
};