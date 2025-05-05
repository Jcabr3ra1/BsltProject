import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/seguridad/usuarios`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getCuentas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/finanzas/cuentas`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/seguridad/roles`)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  getEstados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/seguridad/estados`)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  crearUsuario(data: any): Observable<any> {
    console.log('Enviando petición para crear usuario:', data);
    return this.http.post(`${this.baseUrl}/seguridad/autenticacion/registro`, data)
      .pipe(
        tap(response => {
          console.log('Respuesta al crear usuario:', response);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al crear usuario en el servicio:', error);
          
          // Imprimimos detalles del error para depuración
          if (error.error) {
            console.log('Error details:', error.error);
          }
          
          // Devolvemos el error para que se maneje en el componente
          return throwError(() => error);
        })
      );
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seguridad/usuarios/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/usuarios`)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  actualizarUsuario(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/seguridad/usuarios/${id}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  // Manejador de errores HTTP genérico
  private handleError(error: HttpErrorResponse) {
    console.error('Error en la petición HTTP:', error);
    return throwError(() => error);
  }
}