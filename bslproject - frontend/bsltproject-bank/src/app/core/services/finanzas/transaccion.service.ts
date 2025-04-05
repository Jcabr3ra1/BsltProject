// src/app/core/services/finanzas/transaccion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseApiService } from '../base-api.service';
import { Transaccion, TransaccionRequest } from '@core/models/finanzas/transaccion.model';
import { Cuenta } from '@core/models/finanzas/cuenta.model';
import { environment } from '@environments/environment';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../seguridad/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService extends BaseApiService<Transaccion> {
  constructor(
    http: HttpClient,
    protected override authService: AuthService
  ) {
    super(http, `${environment.apiGatewayUrl}/finanzas/transacciones`, authService);
  }
  
  // Método para obtener cuentas del usuario actual
  getAccounts(): Observable<Cuenta[]> {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario');
      return of([]);
    }
    
    // Usar ID de usuario fijo para usuarios conocidos (para pruebas)
    let finalUserId = userId;
    if (userId === '67a2661729e4496e2f332d59') {
      finalUserId = '67a2661729e4496e2f332d59'; // Admin
    } else if (userId === '67d362f17a90d255eaf9c510') {
      finalUserId = '67d362f17a90d255eaf9c510'; // Usuario test
    }
    
    console.log(`Obteniendo cuentas para usuario: ${finalUserId}`);
    
    // Asegurar que se incluya el token de autorización
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getToken() || ''
    });
    
    // Usar la URL correcta con el prefijo /finanzas
    return this.http.get<Cuenta[]>(
      `${environment.apiGatewayUrl}/finanzas/cuentas/usuario/${finalUserId}`,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error al obtener cuentas:', error);
        return of([]);
      })
    );
  }
  
  // Método especializado para obtener transacciones por usuario
  obtenerTransaccionesPorUsuario(usuarioId: string): Observable<Transaccion[]> {
    // Asegurar que se incluya el token de autorización
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getToken() || ''
    });
    
    return this.http.get<Transaccion[]>(
      `${environment.apiGatewayUrl}/finanzas/transacciones/usuario/${usuarioId}`,
      { headers }
    ).pipe(catchError(error => {
      console.error('Error al obtener transacciones:', error);
      return of([]);
    }));
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
  
  // Método para crear una nueva transacción
  createTransaction(transaccion: TransaccionRequest): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiGatewayUrl}/finanzas/transacciones`,
      transaccion,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método para eliminar una transacción
  deleteTransaction(transaccionId: string): Observable<any> {
    return this.http.delete(
      `${environment.apiGatewayUrl}/finanzas/transacciones/${transaccionId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método para rechazar una transacción
  rejectTransaction(transaccionId: string): Observable<any> {
    return this.http.put(
      `${environment.apiGatewayUrl}/finanzas/transacciones/${transaccionId}/rechazar`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método para aprobar una transacción
  approveTransaction(transaccionId: string): Observable<any> {
    return this.http.put(
      `${environment.apiGatewayUrl}/finanzas/transacciones/${transaccionId}/aprobar`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método para obtener todas las transacciones del usuario actual
  getTransactions(): Observable<Transaccion[]> {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario');
      return of([]);
    }
    
    return this.obtenerTransaccionesPorUsuario(userId);
  }
}