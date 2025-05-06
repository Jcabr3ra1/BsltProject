import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { Transaccion } from '../../../../../core/models/transaccion.model';

@Injectable({
  providedIn: 'root',
})
export class TransaccionService {
  private baseUrl = `${environment.apiUrl}/finanzas/transacciones`;

  constructor(private http: HttpClient) {}

  // ------------------ CRUD GENERAL ------------------

  getTransacciones(): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(this.baseUrl);
  }

  getTransaccionesPorUsuario(id_usuario: string): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(`${this.baseUrl}/usuario/${id_usuario}`);
  }

  getProximosPagos(id_usuario: string): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(`${this.baseUrl}/usuario/${id_usuario}/proximos-pagos`);
  }

  crearTransaccion(transaccion: Transaccion): Observable<any> {
    return this.http.post(this.baseUrl, transaccion);
  }

  anularTransaccion(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/anular`, {});
  }

  eliminarTransaccion(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  actualizarTransaccion(id: string, data: Partial<Transaccion>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  // ------------------ TRANSFERENCIAS ------------------

  transferenciaCuentaCuenta(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/transferencias/cuenta-cuenta`, data);
  }

  transferenciaCuentaBolsillo(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/transferencias/cuenta-bolsillo`, data);
  }

  transferenciaBolsilloCuenta(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/transferencias/bolsillo-cuenta`, data);
  }

  transferenciaBolsilloBolsillo(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/finanzas/transferencias/bolsillo-bolsillo`, data);
  }

  // ------------------ CONSIGNACIONES (Banco → sistema) ------------------

  consignacionBancoCuenta(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/consignaciones/banco-cuenta`, data);
  }

  consignacionBancoBolsillo(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/consignaciones/banco-bolsillo`, data);
  }

  // ------------------ RETIROS (Sistema → banco) ------------------

  retiroCuentaBanco(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/retiros/cuenta-banco`, data);
  }

  retiroBolsilloCuenta(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/retiros/bolsillo-cuenta`, data);
  }

  retiroBolsilloBanco(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/retiros/bolsillo-banco`, data);
  }
}
