import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TipoMovimiento } from '@core/models/finanzas/tipo-movimiento.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoMovimientoService {
  private baseUrl = `${environment.financeUrl}/tipos-movimiento`;
  private headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<TipoMovimiento[]> {
    return this.http.get<TipoMovimiento[]>(this.baseUrl, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  obtenerPorId(id: string): Observable<TipoMovimiento> {
    return this.http.get<TipoMovimiento>(`${this.baseUrl}/${id}`, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  crear(tipoMovimiento: TipoMovimiento): Observable<TipoMovimiento> {
    return this.http.post<TipoMovimiento>(this.baseUrl, tipoMovimiento, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  actualizar(id: string, tipoMovimiento: TipoMovimiento): Observable<TipoMovimiento> {
    return this.http.put<TipoMovimiento>(`${this.baseUrl}/${id}`, tipoMovimiento, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  toggleEstado(id: string): Observable<TipoMovimiento> {
    return this.http.post<TipoMovimiento>(`${this.baseUrl}/${id}/toggle-estado`, {}, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en TipoMovimientoService:', error);
    return throwError(() => error);
  }
}
