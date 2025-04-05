// src/app/core/services/finanzas/cuenta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from '../base-api.service';
import { Cuenta } from '@core/models/finanzas/cuenta.model';
import { environment } from '@environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class CuentaService extends BaseApiService<Cuenta> {
  constructor(
    http: HttpClient,
    private dialog: MatDialog
  ) {
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

  /**
   * Abre el diálogo para crear o editar una cuenta
   * @param cuenta Opcional, cuenta a editar
   * @returns Referencia al diálogo
   */
  abrirDialogoCuenta(cuenta?: Cuenta): MatDialogRef<any> {
    // Debido a que no podemos importar directamente los componentes de diálogo
    // (para evitar dependencias circulares), devolvemos un MatDialogRef<any>
    // que será manejado por el componente que lo llama
    return this.dialog.open(Object, {
      width: '500px',
      data: { account: cuenta }
    });
  }

  /**
   * Abre el diálogo para asignar un usuario a una cuenta
   * @param cuenta Cuenta a la que se asignará el usuario
   * @returns Referencia al diálogo
   */
  abrirDialogoAsignarUsuario(cuenta: Cuenta): MatDialogRef<any> {
    // Debido a que no podemos importar directamente los componentes de diálogo
    // (para evitar dependencias circulares), devolvemos un MatDialogRef<any>
    // que será manejado por el componente que lo llama
    return this.dialog.open(Object, {
      width: '500px',
      data: { account: cuenta }
    });
  }
}