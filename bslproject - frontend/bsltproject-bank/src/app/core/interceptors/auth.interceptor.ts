import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Agregar token a la solicitud
    const token = localStorage.getItem('token');
    
    if (token && !request.url.includes('/auth/login') && !request.url.includes('/auth/register')) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
        }
      });
      
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.router.navigate(['/auth/login']);
          }
          return throwError(() => error);
        })
      );
    }
    
    return next.handle(request);
  }
}