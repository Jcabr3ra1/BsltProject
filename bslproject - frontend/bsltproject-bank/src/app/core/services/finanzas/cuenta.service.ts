// src/app/core/services/finanzas/cuenta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from '../base-api.service';
import { Cuenta } from '@core/models/finanzas/cuenta.model';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CuentaService extends BaseApiService<Cuenta> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiGatewayUrl}/finanzas/cuentas`);
  }
  
  // Método especializado para obtener cuentas por usuario
  obtenerCuentasPorUsuario(usuarioId: string): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(
      `${this.baseUrl}/usuario/${usuarioId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método especializado para asignar usuario a cuenta
  asignarUsuario(cuentaId: string, usuarioId: string): Observable<Cuenta> {
    return this.http.put<Cuenta>(
      `${this.baseUrl}/${cuentaId}/usuario/${usuarioId}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
}