import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Account, TipoCuenta } from '@core/models/finanzas/cuenta.model';
import { environment } from '@environments/environment';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CuentaDialogComponent } from '@features/finanzas/cuentas/cuenta-dialog/cuenta-dialog.component';
import { AsignarUsuarioDialogComponent } from '@features/finanzas/cuentas/asignar-usuario-dialog/asignar-usuario-dialog.component';
import { AuthService } from '@core/services/seguridad/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CuentaService {
  private readonly apiGatewayUrl = `${environment.apiGatewayUrl}/finanzas/cuentas`;

  constructor(
    private readonly http: HttpClient,
    private readonly dialog: MatDialog,
    private readonly authService: AuthService
  ) {
    console.log('CuentaService inicializado');
    console.log('API URL base:', this.apiGatewayUrl);
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  obtenerTodos(): Observable<Account[]> {
    return this.http.get<Account[]>(
      `${this.apiGatewayUrl}`,
      this.getHeaders()
    ).pipe(
      tap(data => console.log('Datos de cuentas recibidos:', data)),
      catchError(error => {
        console.error('Error al obtener cuentas:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerCuenta(id: string): Observable<Account> {
    return this.http.get<Account>(
      `${this.apiGatewayUrl}/${id}`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al obtener cuenta:', error);
        return throwError(() => error);
      })
    );
  }

  crear(cuenta: Partial<Account>): Observable<Account> {
    return this.http.post<Account>(
      `${this.apiGatewayUrl}`,
      cuenta,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al crear cuenta:', error);
        return throwError(() => error);
      })
    );
  }

  actualizar(id: string, cuenta: Partial<Account>): Observable<Account> {
    console.log('Actualizando cuenta:', id, cuenta);
    
    // Asegurarnos de que el ID sea un string
    const accountId = id.toString();
    
    // Asegurarnos de que la cuenta tenga los campos necesarios
    const cuentaActualizada = {
      ...cuenta,
      id: accountId // Asegurarnos de que el ID esté incluido
    };
    
    console.log('Datos enviados para actualización:', cuentaActualizada);
    
    return this.http.put<Account>(
      `${this.apiGatewayUrl}/${accountId}`,
      cuentaActualizada,
      this.getHeaders()
    ).pipe(
      tap(result => console.log('Respuesta de actualización:', result)),
      catchError(error => {
        console.error('Error al actualizar cuenta:', error);
        return throwError(() => error);
      })
    );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiGatewayUrl}/${id}`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al eliminar cuenta:', error);
        return throwError(() => error);
      })
    );
  }

  actualizarSaldo(id: string, monto: number): Observable<Account> {
    return this.http.put<Account>(
      `${this.apiGatewayUrl}/${id}/saldo`,
      { monto },
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al actualizar saldo:', error);
        return throwError(() => error);
      })
    );
  }

  asignarUsuario(idCuenta: string, idUsuario: string): Observable<any> {
    console.log(`Llamando a API para asignar usuario ${idUsuario} a cuenta ${idCuenta}`);
    
    // Validar que ambos IDs sean strings válidos
    if (!idCuenta || typeof idCuenta !== 'string') {
      console.error('Error: ID de cuenta inválido:', idCuenta);
      return throwError(() => new Error('ID de cuenta inválido'));
    }
    
    if (!idUsuario || typeof idUsuario !== 'string') {
      console.error('Error: ID de usuario inválido:', idUsuario);
      return throwError(() => new Error('ID de usuario inválido'));
    }
    
    // Construir la URL correcta con el prefijo /finanzas
    const url = `${this.apiGatewayUrl}/${idCuenta}/usuario/${idUsuario}`;
    console.log(`URL para asignar usuario: ${url}`);
    
    return this.http.put<any>(
      url,
      {},
      this.getHeaders()
    ).pipe(
      tap(response => console.log('Respuesta de asignación de usuario:', response)),
      catchError(error => {
        console.error('Error al asignar usuario a cuenta:', error);
        
        // Información detallada del error para depuración
        if (error.error) {
          console.error('Detalles del error:', error.error);
        }
        
        return throwError(() => error);
      })
    );
  }

  obtenerTiposCuenta(): Observable<TipoCuenta[]> {
    return this.http.get<TipoCuenta[]>(
      `${this.apiGatewayUrl}/tipos-cuenta`,
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
      `${this.apiGatewayUrl}/${id}/transacciones`,
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
      `${this.apiGatewayUrl}/${id}/saldo`,
      this.getHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error al obtener saldo de cuenta:', error);
        return throwError(() => error);
      })
    );
  }

  abrirDialogoCuenta(account?: Account): MatDialogRef<CuentaDialogComponent> {
    // Solo pasamos la cuenta, sin userId para que se pueda crear sin usuario
    return this.dialog.open(CuentaDialogComponent, {
      width: '500px',
      disableClose: true,
      panelClass: 'custom-dialog',
      data: { account }
    });
  }

  abrirDialogoAsignarUsuario(account: Account): MatDialogRef<AsignarUsuarioDialogComponent, any> {
    console.log('Abriendo diálogo para asignar usuario a cuenta:', account);
    
    // Validación adicional para asegurar que la cuenta tenga un ID válido
    if (!account || !account.id) {
      console.error('Error: Intentando abrir diálogo con cuenta inválida:', account);
      throw new Error('La cuenta no tiene un ID válido');
    }
    
    return this.dialog.open(AsignarUsuarioDialogComponent, {
      width: '500px',
      disableClose: true,
      panelClass: 'custom-dialog',
      data: { account }
    });
  }
}
