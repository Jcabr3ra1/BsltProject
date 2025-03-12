import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Cuenta } from '@core/models/finanzas/cuenta.model';
import { TipoCuenta } from '@core/models/finanzas/tipo-cuenta.model';
import { environment } from '@environments/environment';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CuentaDialogComponent } from '@features/finanzas/cuentas/cuenta-dialog/cuenta-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class CuentaService {
  private readonly baseUrl = `${environment.financeUrl}/cuentas`;

  constructor(
    private readonly http: HttpClient,
    private readonly dialog: MatDialog
  ) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  obtenerTodos(): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(
      `${this.baseUrl}`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al obtener cuentas:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerCuenta(id: string): Observable<Cuenta> {
    return this.http.get<Cuenta>(
      `${this.baseUrl}/${id}`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al obtener cuenta:', error);
        return throwError(() => error);
      })
    );
  }

  crear(cuenta: Partial<Cuenta>): Observable<Cuenta> {
    return this.http.post<Cuenta>(
      `${this.baseUrl}`,
      cuenta,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al crear cuenta:', error);
        return throwError(() => error);
      })
    );
  }

  actualizar(id: string, cuenta: Partial<Cuenta>): Observable<Cuenta> {
    return this.http.put<Cuenta>(
      `${this.baseUrl}/${id}`,
      cuenta,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al actualizar cuenta:', error);
        return throwError(() => error);
      })
    );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${id}`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al eliminar cuenta:', error);
        return throwError(() => error);
      })
    );
  }

  actualizarSaldo(id: string, monto: number): Observable<Cuenta> {
    return this.http.put<Cuenta>(
      `${this.baseUrl}/${id}/saldo`,
      { monto },
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al actualizar saldo:', error);
        return throwError(() => error);
      })
    );
  }

  asignarUsuario(idCuenta: string, idUsuario: string): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/${idCuenta}/asignar-usuario/${idUsuario}`,
      {},
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al asignar usuario:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerTiposCuenta(): Observable<TipoCuenta[]> {
    return this.http.get<TipoCuenta[]>(
      `${this.baseUrl}/tipos-cuenta`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al obtener tipos de cuenta:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerTransaccionesCuenta(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/${id}/transacciones`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al obtener transacciones de cuenta:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerSaldoCuenta(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/${id}/saldo`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al obtener saldo de cuenta:', error);
        return throwError(() => error);
      })
    );
  }

  abrirDialogoCuenta(cuenta?: Cuenta): MatDialogRef<CuentaDialogComponent> {
    return this.dialog.open(CuentaDialogComponent, {
      width: '500px',
      data: { cuenta }
    });
  }
}
