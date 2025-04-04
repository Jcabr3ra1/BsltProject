import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Usuario } from '../../models/seguridad/usuario.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiGatewayUrl = environment.apiGatewayUrl;

  constructor(private http: HttpClient) { }

  getApiUrl(): string {
    return this.apiGatewayUrl;
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<any>(`${this.apiGatewayUrl}/seguridad/usuarios`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Manejar diferentes formatos de respuesta API
          const usuarios = response.data || response.usuarios || response || [];
          
          // Hacer un log de los datos recibidos para depuración
          console.log('Respuesta procesada del API:', usuarios);
          
          return Array.isArray(usuarios) ? usuarios : [];
        }),
        catchError(error => {
          console.error('Error en servicio de usuarios:', error);
          return throwError(() => error);
        })
      );
  }

  getUsuario(id: string): Observable<Usuario> {
    return this.http.get<any>(`${this.apiGatewayUrl}/seguridad/usuarios/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Manejar diferentes formatos de respuesta API
          return response.data || response.usuario || response;
        }),
        catchError(error => throwError(() => error))
      );
  }

  crearUsuario(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.post<any>(`${this.apiGatewayUrl}/seguridad/usuarios`, usuario, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data || response.usuario || response),
        catchError(error => throwError(() => error))
      );
  }

  actualizarUsuario(id: string, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<any>(`${this.apiGatewayUrl}/seguridad/usuarios/${id}`, usuario, { headers: this.getHeaders() })
      .pipe(
        map(response => response.data || response.usuario || response),
        catchError(error => throwError(() => error))
      );
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiGatewayUrl}/seguridad/usuarios/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => throwError(() => error))
      );
  }
}
