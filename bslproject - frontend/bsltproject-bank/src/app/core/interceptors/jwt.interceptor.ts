import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/seguridad/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Obtener el token directamente del método getToken
        const token = this.authService.getToken();
        
        if (token) {
            // Verificar si el token ya incluye el prefijo 'Bearer'
            const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            
            request = request.clone({
                setHeaders: {
                    Authorization: tokenValue
                }
            });
        }
        return next.handle(request);
    }
}
