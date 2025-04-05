// src/app/core/services/seguridad/usuarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BaseApiService } from '../base-api.service';
import { Usuario } from '@core/models/seguridad/usuario.model';
import { Rol } from '@core/models/seguridad/rol.model';
import { Estado } from '@core/models/seguridad/estado.model';
import { environment } from '@environments/environment';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseApiService<Usuario> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiGatewayUrl}/seguridad/usuarios`);
  }
  
  // Método para obtener todos los usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.obtenerTodos();
  }
  
  // Métodos para actualizar rol y estado
  actualizarRol(usuarioId: string, rolId: string): Observable<Usuario> {
    return this.asignarRol(usuarioId, rolId);
  }
  
  actualizarEstado(usuarioId: string, estadoId: string): Observable<Usuario> {
    return this.asignarEstado(usuarioId, estadoId);
  }
  
  // Método para eliminar usuario
  eliminarUsuario(usuarioId: string): Observable<any> {
    return this.eliminar(usuarioId).pipe(
      catchError(error => this.handleCustomError('eliminar usuario', error))
    );
  }
  
  // Método para obtener roles
  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${environment.apiGatewayUrl}/seguridad/roles`).pipe(
      map(roles => {
        console.log('Roles obtenidos:', roles);
        return roles;
      }),
      catchError(error => {
        console.error('Error al obtener roles:', error);
        return throwError(() => new Error(`Error al obtener roles: ${error.message || error}`));
      })
    );
  }
  
  // Método para obtener estados
  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${environment.apiGatewayUrl}/seguridad/estados`).pipe(
      map(estados => {
        console.log('Estados obtenidos:', estados);
        return estados;
      }),
      catchError(error => {
        console.error('Error al obtener estados:', error);
        return throwError(() => new Error(`Error al obtener estados: ${error.message || error}`));
      })
    );
  }
  
  // Método para manejar errores personalizado
  private handleCustomError(operation: string, error: any): Observable<never> {
    console.error(`Error en ${operation}:`, error);
    return throwError(() => new Error(`Error en ${operation}: ${error.message || error}`));
  }
  
  // Método especializado para asignar rol a usuario
  asignarRol(usuarioId: string, rolId: string): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.baseUrl}/${usuarioId}/roles/${rolId}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método especializado para asignar estado a usuario
  asignarEstado(usuarioId: string, estadoId: string): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.baseUrl}/${usuarioId}/estados/${estadoId}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método especializado para asignar cuenta a usuario
  asignarCuenta(usuarioId: string, cuentaId: string): Observable<Usuario> {
    return this.http.put<Usuario>(
      `${this.baseUrl}/${usuarioId}/cuentas/${cuentaId}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
}