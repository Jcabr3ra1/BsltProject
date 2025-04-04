import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TipoTransaccion } from '@core/models/finanzas/tipo-transaccion.model';

@Injectable({
  providedIn: 'root'
})
export class TipoTransaccionService {
  private apiGatewayUrl = `${environment.apiGatewayUrl}/finanzas/tipo_transaccion`;

  constructor(private http: HttpClient) {
    console.log('TipoTransaccionService inicializado');
    console.log('URL de la API de tipos de transacción:', this.apiGatewayUrl);
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

  getTiposTransaccion(): Observable<TipoTransaccion[]> {
    console.log('Obteniendo tipos de transacción desde:', this.apiGatewayUrl);
    return this.http.get<TipoTransaccion[]>(this.apiGatewayUrl, this.getHeaders()).pipe(
      tap(tipos => {
        console.log('Tipos de transacción obtenidos:', tipos);
      }),
      catchError(error => {
        console.error('Error al obtener tipos de transacción:', error);
        return throwError(() => new Error('Error al obtener tipos de transacción'));
      })
    );
  }

  getTipoTransaccionById(id: string): Observable<TipoTransaccion> {
    console.log('Obteniendo tipo de transacción por ID desde:', `${this.apiGatewayUrl}/${id}`);
    return this.http.get<TipoTransaccion>(`${this.apiGatewayUrl}/${id}`, this.getHeaders()).pipe(
      tap(tipo => {
        console.log('Tipo de transacción obtenido por ID:', tipo);
      }),
      catchError(error => {
        console.error('Error al obtener tipo de transacción por ID:', error);
        return throwError(() => new Error('Error al obtener tipo de transacción por ID'));
      })
    );
  }

  crearTipoTransaccion(tipoTransaccion: TipoTransaccion): Observable<TipoTransaccion> {
    console.log('Creando tipo de transacción en:', this.apiGatewayUrl);
    return this.http.post<TipoTransaccion>(this.apiGatewayUrl, tipoTransaccion, this.getHeaders()).pipe(
      tap(tipoCreado => {
        console.log('Tipo de transacción creado:', tipoCreado);
      }),
      catchError(error => {
        console.error('Error al crear tipo de transacción:', error);
        return throwError(() => new Error('Error al crear tipo de transacción'));
      })
    );
  }

  actualizarTipoTransaccion(id: string, tipoTransaccion: TipoTransaccion): Observable<TipoTransaccion> {
    console.log('Actualizando tipo de transacción en:', `${this.apiGatewayUrl}/${id}`);
    return this.http.put<TipoTransaccion>(`${this.apiGatewayUrl}/${id}`, tipoTransaccion, this.getHeaders()).pipe(
      tap(tipoActualizado => {
        console.log('Tipo de transacción actualizado:', tipoActualizado);
      }),
      catchError(error => {
        console.error('Error al actualizar tipo de transacción:', error);
        return throwError(() => new Error('Error al actualizar tipo de transacción'));
      })
    );
  }

  eliminarTipoTransaccion(id: string): Observable<void> {
    console.log('Eliminando tipo de transacción desde:', `${this.apiGatewayUrl}/${id}`);
    return this.http.delete<void>(`${this.apiGatewayUrl}/${id}`, this.getHeaders()).pipe(
      tap(() => {
        console.log('Tipo de transacción eliminado');
      }),
      catchError(error => {
        console.error('Error al eliminar tipo de transacción:', error);
        return throwError(() => new Error('Error al eliminar tipo de transacción'));
      })
    );
  }
}
