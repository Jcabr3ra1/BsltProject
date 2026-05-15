import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Usuario } from '../../../../../core/models/usuario.model';
import { Rol } from '../../../../../core/models/rol.model';
import { Estado } from '../../../../../core/models/estado.model';
import { Cuenta } from '../../../../../core/models/cuenta.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/seguridad/usuarios`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getCuentas(): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${this.baseUrl}/finanzas/cuentas`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl}/seguridad/roles`)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.baseUrl}/seguridad/estados`)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  crearUsuario(data: Record<string, unknown>): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/seguridad/autenticacion/registro`, data)
      .pipe(
        tap(response => {
          }),
        catchError((error: HttpErrorResponse) => {
          if (error.error) {
            }
          
          return throwError(() => error);
        })
      );
  }

  eliminarUsuario(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/seguridad/usuarios/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  actualizarUsuario(id: string, data: Record<string, unknown>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/seguridad/usuarios/${id}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}