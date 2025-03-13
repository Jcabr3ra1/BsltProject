/**
 * @deprecated This interceptor is deprecated and should not be used.
 * Token handling has been moved to AuthInterceptor for better management of:
 * - Token refresh
 * - Error handling
 * - API Gateway request filtering
 * 
 * The AuthInterceptor now handles:
 * 1. Adding tokens to API Gateway requests
 * 2. Automatic token refresh on 401 errors
 * 3. Proper error handling and user redirection
 * 4. Request queueing during token refresh
 * 
 * Please use AuthInterceptor instead.
 */

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.warn('JwtInterceptor is deprecated. Please use AuthInterceptor instead.');
        return next.handle(request);
    }
}
