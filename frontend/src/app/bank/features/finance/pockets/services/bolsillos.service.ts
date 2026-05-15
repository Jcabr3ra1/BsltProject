import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { Bolsillo } from '../../../../../core/models/bolsillo.model';

@Injectable({
  providedIn: 'root',
})
export class BolsillosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBolsillos(): Observable<Bolsillo[]> {
    return this.http.get<Bolsillo[]>(`${this.baseUrl}/finanzas/bolsillos`);
  }
  

  crearBolsillo(datos: Partial<Bolsillo>): Observable<Bolsillo> {
    return this.http.post<Bolsillo>(`${this.baseUrl}/finanzas/bolsillos`, datos);
  }
  
  actualizarBolsillo(id: string, bolsillo: Partial<Bolsillo>): Observable<Bolsillo> {
    return this.http.put<Bolsillo>(`${this.baseUrl}/finanzas/bolsillos/${id}`, bolsillo);
  }

  eliminarBolsillo(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/finanzas/bolsillos/${id}`);
  }

  desasociarYEliminarBolsillo(id: string): Observable<Bolsillo> {
    return this.http.delete<Bolsillo>(`${this.baseUrl}/finanzas/bolsillos/${id}/desasociar`);
  }
  

  asignarBolsilloACuenta(id_bolsillo: string, id_cuenta: string): Observable<Bolsillo> {
    return this.http.put<Bolsillo>(`${this.baseUrl}/finanzas/bolsillos/${id_bolsillo}/cuentas/${id_cuenta}`, {});
  }
  
}
