import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    // Primero anulamos la transacción en el backend (cambia a estado ANULADA)
    return this.http.put(`${this.baseUrl}/${id}/anular`, {}).pipe(
      // Luego eliminamos la transacción localmente en el frontend
      // El backend solo cambia el estado a ANULADA pero no la elimina
      map(response => ({
        ...response,
        eliminado: true // Marcador para que el frontend sepa que debe eliminar esta transacción de la lista
      }))
    );
  }

  eliminarTransaccion(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  actualizarTransaccion(id: string, data: Partial<Transaccion>): Observable<any> {
    // Volvemos a usar PUT ya que el backend está configurado para aceptar PUT
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }
  
  aprobarTransaccion(id: string): Observable<any> {
    // Usamos la URL completa para asegurar que se dirija correctamente
    return this.http.put(`${this.baseUrl}/${id}/aprobar`, {
      estado: 'APROBADA'
    });
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
