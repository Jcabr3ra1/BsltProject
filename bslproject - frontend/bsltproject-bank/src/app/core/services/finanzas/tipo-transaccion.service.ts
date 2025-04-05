import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, delay, map } from 'rxjs';
import { environment } from '@environments/environment';
import { TipoTransaccion } from '@core/models/finanzas/tipo-transaccion.model';
import { TipoTransaccion as TipoTransaccionEnum } from '@core/models/finanzas/transaccion.model';

@Injectable({
  providedIn: 'root'
})
export class TipoTransaccionService {
  // La estructura correcta según el backend es: {URL_GATEWAY}/finanzas/tipos-transaccion
  private apiUrl = `${environment.apiGatewayUrl}/finanzas/tipos-transaccion`;

  constructor(private http: HttpClient) {
    console.log('TipoTransaccionService inicializado');
    console.log('URL de la API de tipos de transacción:', this.apiUrl);
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': token && token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  getTiposTransaccion(): Observable<TipoTransaccion[]> {
    console.log('Obteniendo tipos de transacción del backend');
    
    return this.http.get<TipoTransaccion[]>(this.apiUrl).pipe(
      tap(tipos => console.log('Tipos de transacción obtenidos del backend:', tipos)),
      catchError(error => {
        console.error('Error al obtener tipos de transacción:', error);
        return throwError(() => new Error('Error al obtener tipos de transacción'));
      })
    );
  }

  getTipoTransaccionById(id: string): Observable<TipoTransaccion> {
    console.log(`Obteniendo tipo de transacción con ID ${id} del backend`);
    
    return this.http.get<TipoTransaccion>(`${this.apiUrl}/${id}`).pipe(
      tap(tipo => console.log(`Tipo de transacción con ID ${id} obtenido del backend:`, tipo)),
      catchError(error => {
        console.error(`Error al obtener tipo de transacción con ID ${id}:`, error);
        return throwError(() => new Error(`Error al obtener tipo de transacción con ID ${id}`));
      })
    );
  }

  crearTipoTransaccion(tipoTransaccion: TipoTransaccion): Observable<TipoTransaccion> {
    console.log('Creando tipo de transacción en el backend:', tipoTransaccion);
    
    return this.http.post<TipoTransaccion>(this.apiUrl, tipoTransaccion).pipe(
      tap(created => console.log('Tipo de transacción creado en el backend:', created)),
      catchError(error => {
        console.error('Error al crear tipo de transacción:', error);
        return throwError(() => new Error('Error al crear tipo de transacción'));
      })
    );
  }

  actualizarTipoTransaccion(id: string, tipoTransaccion: Partial<TipoTransaccion>): Observable<TipoTransaccion> {
    console.log(`Actualizando tipo de transacción con ID ${id} en el backend:`, tipoTransaccion);
    
    return this.http.put<TipoTransaccion>(`${this.apiUrl}/${id}`, tipoTransaccion).pipe(
      tap(updated => console.log('Tipo de transacción actualizado en el backend:', updated)),
      catchError(error => {
        console.error(`Error al actualizar tipo de transacción con ID ${id}:`, error);
        return throwError(() => new Error(`Error al actualizar tipo de transacción con ID ${id}`));
      })
    );
  }

  eliminarTipoTransaccion(id: string): Observable<void> {
    console.log(`Eliminando tipo de transacción con ID ${id} en el backend`);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log(`Tipo de transacción con ID ${id} eliminado del backend`)),
      catchError(error => {
        console.error(`Error al eliminar tipo de transacción con ID ${id}:`, error);
        return throwError(() => new Error(`Error al eliminar tipo de transacción con ID ${id}`));
      })
    );
  }
}