import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TipoTransaccion } from '../../../core/models/finanzas/transaccion.model';

@Injectable({
  providedIn: 'root'
})
export class TipoTransaccionService {
  private apiUrl = `${environment.apiUrl}/finanzas/tipo_transaccion`;

  constructor(private http: HttpClient) { }

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
    // Verificamos si hay datos en el backend, si no, devolvemos datos de prueba
    if (environment.production) {
      return this.http.get<TipoTransaccion[]>(this.apiUrl, this.getHeaders());
    } else {
      // Datos de prueba para desarrollo
      const mockTiposTransaccion: TipoTransaccion[] = [
        {
          id: '1',
          nombre: 'Transferencia',
          descripcion: 'Transferencia entre cuentas',
          requiereDestino: true
        },
        {
          id: '2',
          nombre: 'Retiro',
          descripcion: 'Retiro de dinero',
          requiereDestino: false
        },
        {
          id: '3',
          nombre: 'Depósito',
          descripcion: 'Depósito de dinero',
          requiereDestino: true
        }
      ];
      return of(mockTiposTransaccion);
    }
  }

  getTipoTransaccionById(id: string): Observable<TipoTransaccion> {
    return this.http.get<TipoTransaccion>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  crearTipoTransaccion(tipoTransaccion: TipoTransaccion): Observable<TipoTransaccion> {
    return this.http.post<TipoTransaccion>(this.apiUrl, tipoTransaccion, this.getHeaders());
  }

  actualizarTipoTransaccion(id: string, tipoTransaccion: TipoTransaccion): Observable<TipoTransaccion> {
    return this.http.put<TipoTransaccion>(`${this.apiUrl}/${id}`, tipoTransaccion, this.getHeaders());
  }

  eliminarTipoTransaccion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}
