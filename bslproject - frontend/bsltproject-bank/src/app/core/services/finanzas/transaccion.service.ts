// src/app/core/services/finanzas/transaccion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from '../base-api.service';
import { Transaccion, TransaccionRequest } from '@core/models/finanzas/transaccion.model';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService extends BaseApiService<Transaccion> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiGatewayUrl}/finanzas/transacciones`);
  }
  
  // Método especializado para obtener transacciones por usuario
  obtenerTransaccionesPorUsuario(usuarioId: string): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(
      `${this.baseUrl}/usuario/${usuarioId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método especializado para transferencias cuenta a cuenta
  transferenciaCuentaCuenta(transaccion: TransaccionRequest): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiGatewayUrl}/finanzas/transferencias/cuenta-cuenta`,
      transaccion,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método especializado para transferencias cuenta a bolsillo
  transferenciaCuentaBolsillo(transaccion: TransaccionRequest): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiGatewayUrl}/finanzas/transferencias/cuenta-bolsillo`,
      transaccion,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método especializado para transferencias bolsillo a cuenta
  transferenciaBolsilloCuenta(transaccion: TransaccionRequest): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiGatewayUrl}/finanzas/transferencias/bolsillo-cuenta`,
      transaccion,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
}