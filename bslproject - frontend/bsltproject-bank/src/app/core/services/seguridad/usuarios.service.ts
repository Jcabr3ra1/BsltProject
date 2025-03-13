import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Usuario, RolUsuario, EstadoUsuario } from '@core/models/seguridad/usuario.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly API_URL = `${environment.apiGatewayUrl}/seguridad/usuarios`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API_URL, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Usuarios obtenidos:', response)),
      catchError(this.handleError)
    );
  }

  getUsuario(id: string): Observable<Usuario> {
    const url = `${this.API_URL}/${id}`;
    return this.http.get<Usuario>(url, { headers: this.getHeaders() }).pipe(
      tap(usuario => console.log('Usuario obtenido:', usuario)),
      catchError(this.handleError)
    );
  }

  actualizarRol(usuarioId: string, rol: RolUsuario): Observable<Usuario> {
    const url = `${this.API_URL}/${usuarioId}/roles/${rol}`;
    return this.http.put<Usuario>(url, {}, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Rol actualizado:', response)),
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 409) {
          return throwError(() => new Error('Ya existe un usuario con ese rol'));
        }
        return this.handleError(error);
      })
    );
  }

  actualizarEstado(usuarioId: string, estado: EstadoUsuario): Observable<Usuario> {
    const url = `${this.API_URL}/${usuarioId}/status/${estado}`;
    return this.http.put<Usuario>(url, {}, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Estado actualizado:', response)),
      catchError(this.handleError)
    );
  }

  eliminarUsuario(usuarioId: string): Observable<void> {
    const url = `${this.API_URL}/${usuarioId}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() }).pipe(
      tap(() => console.log('Usuario eliminado')),
      catchError(this.handleError)
    );
  }

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
          errorMessage = 'Usuario no encontrado';
          break;
        case 409:
          errorMessage = 'Ya existe un usuario con ese correo electrónico';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = error.error?.message || 'Error desconocido';
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
