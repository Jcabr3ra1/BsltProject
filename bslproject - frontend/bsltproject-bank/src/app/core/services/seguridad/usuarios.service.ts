// src/app/core/services/seguridad/usuarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from '../base-api.service';
import { Usuario } from '@core/models/seguridad/usuario.model';
import { environment } from '@environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    return this.eliminar(usuarioId);
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