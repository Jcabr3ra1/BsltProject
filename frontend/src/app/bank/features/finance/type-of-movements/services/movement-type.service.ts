import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { TipoMovimiento } from '../../../../../core/models/movement-type.model';

@Injectable({
  providedIn: 'root'
})
export class MovementTypeService {
  private baseUrl = `${environment.apiUrl}/finanzas/tipos-movimiento`;

  constructor(private http: HttpClient) {}

  getTiposMovimiento(): Observable<TipoMovimiento[]> {
    return this.http.get<TipoMovimiento[]>(this.baseUrl);
  }

  crearTipoMovimiento(data: TipoMovimiento): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  actualizarTipoMovimiento(id: string, data: Partial<TipoMovimiento>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  eliminarTipoMovimiento(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}

