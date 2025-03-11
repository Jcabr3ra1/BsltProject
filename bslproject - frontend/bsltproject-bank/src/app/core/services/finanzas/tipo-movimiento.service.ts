import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TipoMovimiento } from '../../../core/models/finanzas/tipo-movimiento.model';

@Injectable({
  providedIn: 'root'
})
export class TipoMovimientoService {
  private apiUrl = `${environment.apiUrl}/finanzas/tipo_movimiento`;

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

  getTiposMovimiento(): Observable<TipoMovimiento[]> {
    if (environment.production) {
      return this.http.get<TipoMovimiento[]>(this.apiUrl, this.getHeaders());
    } else {
      // Datos de prueba para desarrollo
      const mockTiposMovimiento: TipoMovimiento[] = [
        {
          id: '1',
          nombre: 'Transferencia entre cuentas',
          descripcion: 'Transferencia de fondos entre cuentas propias',
          codigoOrigen: 'ACCOUNT',
          codigoDestino: 'ACCOUNT',
          afectaSaldo: true
        },
        {
          id: '2',
          nombre: 'Transferencia a bolsillo',
          descripcion: 'Transferencia desde cuenta a bolsillo',
          codigoOrigen: 'ACCOUNT',
          codigoDestino: 'WALLET',
          afectaSaldo: true
        },
        {
          id: '3',
          nombre: 'Transferencia desde bolsillo',
          descripcion: 'Transferencia desde bolsillo a cuenta',
          codigoOrigen: 'WALLET',
          codigoDestino: 'ACCOUNT',
          afectaSaldo: true
        },
        {
          id: '4',
          nombre: 'Retiro',
          descripcion: 'Retiro de dinero',
          codigoOrigen: 'ACCOUNT',
          codigoDestino: 'BANK',
          afectaSaldo: true
        },
        {
          id: '5',
          nombre: 'Depósito',
          descripcion: 'Depósito de dinero',
          codigoOrigen: 'BANK',
          codigoDestino: 'ACCOUNT',
          afectaSaldo: true
        }
      ];
      return of(mockTiposMovimiento);
    }
  }

  getTipoMovimientoById(id: string): Observable<TipoMovimiento> {
    return this.http.get<TipoMovimiento>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  crearTipoMovimiento(tipoMovimiento: TipoMovimiento): Observable<TipoMovimiento> {
    return this.http.post<TipoMovimiento>(this.apiUrl, tipoMovimiento, this.getHeaders());
  }

  actualizarTipoMovimiento(id: string, tipoMovimiento: TipoMovimiento): Observable<TipoMovimiento> {
    return this.http.put<TipoMovimiento>(`${this.apiUrl}/${id}`, tipoMovimiento, this.getHeaders());
  }

  eliminarTipoMovimiento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}
