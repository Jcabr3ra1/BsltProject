import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';
import { Estado } from '../../../../../core/models/estado.model';

@Injectable({
  providedIn: 'root'
})
export class EstadosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.baseUrl}/seguridad/estados`);
  }

  getEstadoById(id: string): Observable<Estado> {
    return this.http.get<Estado>(`${this.baseUrl}/seguridad/estados/${id}`);
  }

  crearEstado(estado: Partial<Estado>): Observable<Estado> {
    return this.http.post<Estado>(`${this.baseUrl}/seguridad/estados`, estado);
  }

  actualizarEstado(id: string, estado: Partial<Estado>): Observable<Estado> {
    return this.http.put<Estado>(`${this.baseUrl}/seguridad/estados/${id}`, estado);
  }

  eliminarEstado(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seguridad/estados/${id}`);
  }
}
