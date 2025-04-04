import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { TipoMovimiento } from '@core/models/finanzas/tipo-movimiento.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoMovimientoService {
  private baseUrl = `${environment.apiGatewayUrl}/finanzas/tipos-movimiento`;

  constructor(private http: HttpClient) {
    console.log('TipoMovimientoService inicializado');
    console.log('API URL base:', this.baseUrl);
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  obtenerTodos(): Observable<TipoMovimiento[]> {
    // Diagnóstico: verificar token antes de hacer la solicitud
    const token = localStorage.getItem('token');
    console.log('Token actual:', token ? token.substring(0, 20) + '...' : 'No hay token');
    
    try {
      if (token) {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        console.log('Contenido del token:', tokenData);
        console.log('Roles en el token:', tokenData.roles || 'No hay roles');
        console.log('Fecha de expiración:', new Date(tokenData.exp * 1000).toLocaleString());
        console.log('Token expirado:', Date.now() > tokenData.exp * 1000);
      }
    } catch (e) {
      console.error('Error al decodificar el token:', e);
    }
    
    return this.http.get<TipoMovimiento[]>(this.baseUrl, this.getHeaders())
      .pipe(
        tap(data => console.log('Datos recibidos de tipos de movimiento:', data)),
        catchError(this.handleError)
      );
  }

  obtenerPorId(id: string): Observable<TipoMovimiento> {
    return this.http.get<TipoMovimiento>(`${this.baseUrl}/${id}`, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  crear(tipoMovimiento: TipoMovimiento): Observable<TipoMovimiento> {
    return this.http.post<TipoMovimiento>(this.baseUrl, tipoMovimiento, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  actualizar(id: string, tipoMovimiento: TipoMovimiento): Observable<TipoMovimiento> {
    return this.http.put<TipoMovimiento>(`${this.baseUrl}/${id}`, tipoMovimiento, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  toggleEstado(id: string): Observable<TipoMovimiento> {
    return this.http.post<TipoMovimiento>(`${this.baseUrl}/${id}/toggle-estado`, {}, this.getHeaders())
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en TipoMovimientoService:', error);
    return throwError(() => error);
  }
}
