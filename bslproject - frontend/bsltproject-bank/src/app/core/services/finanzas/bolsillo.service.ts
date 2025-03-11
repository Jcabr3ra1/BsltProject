import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bolsillo } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BolsilloService {
  private apiUrl = `${environment.apiUrl}/finanzas/bolsillos`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  getBolsillos(): Observable<Bolsillo[]> {
    return this.http.get<Bolsillo[]>(this.apiUrl, this.getHeaders());
  }

  getBolsillo(id: string): Observable<Bolsillo> {
    return this.http.get<Bolsillo>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  getBolsillosPorCuenta(cuentaId: string): Observable<Bolsillo[]> {
    return this.http.get<Bolsillo[]>(`${this.apiUrl}/cuenta/${cuentaId}`, this.getHeaders());
  }

  crearBolsillo(bolsillo: Bolsillo): Observable<Bolsillo> {
    return this.http.post<Bolsillo>(this.apiUrl, bolsillo, this.getHeaders());
  }

  actualizarBolsillo(id: string, bolsillo: Bolsillo): Observable<Bolsillo> {
    return this.http.put<Bolsillo>(`${this.apiUrl}/${id}`, bolsillo, this.getHeaders());
  }

  eliminarBolsillo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  cerrarBolsillo(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/cerrar`, {}, this.getHeaders());
  }

  transferirEntreBolsillos(idOrigen: string, idDestino: string, monto: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/transferir`, {
      bolsilloOrigenId: idOrigen,
      bolsilloDestinoId: idDestino,
      monto: monto
    }, this.getHeaders());
  }
}
