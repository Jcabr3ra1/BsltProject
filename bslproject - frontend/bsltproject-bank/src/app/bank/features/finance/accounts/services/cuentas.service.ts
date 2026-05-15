import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { Cuenta } from '../../../../../core/models/cuenta.model';
import { Usuario } from '../../../../../core/models/usuario.model';
import { Bolsillo } from '../../../../../core/models/bolsillo.model';

@Injectable({
  providedIn: 'root',
})
export class CuentasService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCuentas(): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${this.baseUrl}/finanzas/cuentas`);
  }

  crearCuenta(data: Partial<Cuenta>): Observable<Cuenta> {
    return this.http.post<Cuenta>(`${this.baseUrl}/finanzas/cuentas`, data);
  }
  

  getCuentasPorUsuario(id_usuario: string): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${this.baseUrl}/finanzas/cuentas/usuario/${id_usuario}`);
  }

  actualizarCuenta(id: string, cuenta: Partial<Cuenta>) {
    return this.http.put(`${this.baseUrl}/finanzas/cuentas/${id}`, cuenta);
  }

  eliminarCuenta(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/finanzas/cuentas/${id}`);
  }

  asignarCuentaAUsuario(cuentaId: string, usuarioId: string) {
    return this.http.put(
      `${this.baseUrl}/finanzas/cuentas/${cuentaId}/usuario/${usuarioId}`,
      {}
    );
  }

  desasociarCuentaDeUsuario(userId: string, cuentaId: string) {
    return this.http.put(
      `${this.baseUrl}/finanzas/usuarios/${userId}/cuentas/desasociar/${cuentaId}`,
      {}
    );
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/seguridad/usuarios`);
  }

  getBolsillos(): Observable<Bolsillo[]> {
    return this.http.get<Bolsillo[]>(`${this.baseUrl}/finanzas/bolsillos`);
  }
}
