import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { TipoTransaccion } from '../../../../../core/models/tipo_transaccion.model';

@Injectable({
  providedIn: 'root'
})
export class TipoTransaccionService {
  private baseUrl = `${environment.apiUrl}/finanzas/tipos-transaccion`;

  constructor(private http: HttpClient) {}

  getTiposTransaccion(): Observable<TipoTransaccion[]> {
    return this.http.get<TipoTransaccion[]>(this.baseUrl);
  }

  crearTipoTransaccion(data: TipoTransaccion): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  actualizarTipoTransaccion(id: string, data: Partial<TipoTransaccion>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  eliminarTipoTransaccion(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
