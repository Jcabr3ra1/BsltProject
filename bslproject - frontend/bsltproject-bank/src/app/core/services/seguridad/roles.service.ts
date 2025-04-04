import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Rol, RolUsuario } from '@core/models/seguridad/usuario.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly API_URL = `${environment.apiGatewayUrl}/seguridad/roles`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  /**
   * Obtiene todos los roles disponibles en el sistema
   */
  obtenerRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.API_URL, { headers: this.getHeaders() }).pipe(
      tap(roles => console.log('Roles obtenidos:', roles)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un rol específico por su ID
   */
  obtenerRol(id: string): Observable<Rol> {
    const url = `${this.API_URL}/${id}`;
    return this.http.get<Rol>(url, { headers: this.getHeaders() }).pipe(
      tap(rol => console.log('Rol obtenido:', rol)),
      catchError(this.handleError)
    );
  }

  /**
   * Maneja los errores de las peticiones HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en la petición HTTP:', error);
    
    let errorMessage = 'Ha ocurrido un error en el servidor';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Solicitud incorrecta';
          break;
        case 401:
          errorMessage = 'No autorizado';
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          break;
        case 404:
          errorMessage = 'Rol no encontrado';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
