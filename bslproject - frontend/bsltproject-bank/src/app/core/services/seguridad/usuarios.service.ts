import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Usuario, RolUsuario, EstadoUsuario } from '@core/models/seguridad/usuario.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly API_URL = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API_URL).pipe(
      catchError(this.handleError)
    );
  }

  getUsuario(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  actualizarRol(usuarioId: string, rol: RolUsuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URL}/${usuarioId}/rol`, { rol }).pipe(
      catchError((error) => {
        // Manejar específicamente el error de usuario duplicado
        if (error instanceof HttpErrorResponse && error.status === 409) {
          return throwError(() => new Error('Ya existe un usuario con ese correo electrónico'));
        }
        return this.handleError(error);
      })
    );
  }

  actualizarEstado(usuarioId: string, estado: EstadoUsuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URL}/${usuarioId}/estado`, { estado }).pipe(
      catchError(this.handleError)
    );
  }

  eliminarUsuario(usuarioId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${usuarioId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error en el servidor';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = error.error.message;
    } else {
      // Error del lado del servidor
      if (error.status === 409) {
        errorMessage = 'Ya existe un usuario con ese correo electrónico';
      } else if (error.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
