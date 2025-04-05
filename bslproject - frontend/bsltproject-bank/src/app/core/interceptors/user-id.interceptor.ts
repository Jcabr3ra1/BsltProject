import { HttpInterceptorFn, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/seguridad/auth.service';

/**
 * Interceptor funcional para añadir el ID del usuario a las solicitudes que lo requieran.
 * 
 * Este interceptor complementa al authInterceptor añadiendo el ID del usuario actual
 * como un encabezado personalizado en solicitudes específicas que lo necesiten.
 * 
 * Nota: La mayoría de la funcionalidad de manejo de errores de autenticación se ha
 * movido al authInterceptor para evitar duplicación.
 */
export const userIdInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Solo añadir el ID de usuario a las solicitudes que lo necesiten
  if (req.url.includes('/finanzas/') && !req.url.includes('/autenticacion/')) {
    const authService = inject(AuthService);
    const userId = authService.getUserId();
    
    if (userId) {
      // Clonar la solicitud y añadir el ID de usuario como encabezado
      const modifiedReq = req.clone({
        setHeaders: {
          'X-User-Id': userId
        }
      });
      
      return next(modifiedReq);
    }
  }
  
  // Para otras solicitudes, continuar sin modificar
  return next(req);
};
