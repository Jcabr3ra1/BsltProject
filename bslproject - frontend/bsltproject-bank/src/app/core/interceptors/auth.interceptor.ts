import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/seguridad/auth.service';
import { LoginResponse } from '../models/seguridad/usuario.model';
import { Router } from '@angular/router';
import { API_CONFIG } from '../config/api.config';

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
  
  // Add token to requests to the API Gateway
  if (token && (
    req.url.includes(API_CONFIG.API_GATEWAY_URL) || 
    req.url.includes('localhost:7777') ||
    req.url.includes('/finanzas/') || 
    req.url.includes('/seguridad/')
  )) {
    console.log('AuthInterceptor - Adding token to request');
    
    // Create a new request with the Authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Log the headers for debugging
    console.log('AuthInterceptor - Headers:');
    authReq.headers.keys().forEach(key => {
      console.log(`${key}: ${authReq.headers.get(key)}`);
    });
    
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('AuthInterceptor - Error:', error.status, error.message);
        
        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          console.log('AuthInterceptor - 401 error, redirecting to login');
          // Clear tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // We can't inject Router in a functional interceptor, so use window.location
          window.location.href = '/auth/login';
        }
        
        return throwError(() => error);
      })
    );
  }
  
  return next(req);
};
