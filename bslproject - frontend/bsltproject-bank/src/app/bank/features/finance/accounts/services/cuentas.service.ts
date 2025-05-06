import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { Cuenta } from '../../../../../core/models/cuenta.model';

@Injectable({
  providedIn: 'root',
})
export class CuentasService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ✅ Obtener todas las cuentas
  getCuentas(): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${this.baseUrl}/finanzas/cuentas`);
  }

  // ✅ Crear nueva cuenta
  crearCuenta(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/finanzas/cuentas`, data);
  }
  

  getCuentasPorUsuario(id_usuario: string): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${this.baseUrl}/finanzas/cuentas/usuario/${id_usuario}`);
  }

  // ✅ Actualizar cuenta
  actualizarCuenta(id: string, cuenta: Partial<Cuenta>) {
    return this.http.put(`${this.baseUrl}/finanzas/cuentas/${id}`, cuenta);
  }

  // ✅ Eliminar cuenta
  eliminarCuenta(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/finanzas/cuentas/${id}`);
  }

  // ✅ Asignar cuenta a usuario (seguridad endpoint)
  asignarCuentaAUsuario(cuentaId: string, usuarioId: string) {
    return this.http.put(
      `${this.baseUrl}/finanzas/cuentas/${cuentaId}/usuario/${usuarioId}`,
      {}
    );
  }

  // ✅ Desasocia una cuenta de un usuario (ruta corregida)
  desasociarCuentaDeUsuario(userId: string, cuentaId: string) {
    return this.http.put(
      `${this.baseUrl}/finanzas/usuarios/${userId}/cuentas/desasociar/${cuentaId}`,
      {}
    );
  }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/seguridad/usuarios`);
  }

  getBolsillos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/finanzas/bolsillos`);
  }
}
