import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { Transaccion } from '../../../../../core/models/transaccion.model';

@Injectable({
  providedIn: 'root',
})
export class TransaccionService {
  private baseUrl = `${environment.apiUrl}/finanzas/transacciones`;

  constructor(private http: HttpClient) {}


  getTransacciones(): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(this.baseUrl);
  }

  getTransaccionesPorUsuario(id_usuario: string): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(
      `${this.baseUrl}/usuario/${id_usuario}`
    );
  }

  getProximosPagos(id_usuario: string): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(
      `${this.baseUrl}/usuario/${id_usuario}/proximos-pagos`
    );
  }

  crearTransaccion(transaccion: Transaccion): Observable<Transaccion> {
    return this.http.post<Transaccion>(this.baseUrl, transaccion);
  }

  anularTransaccion(id: string): Observable<Transaccion> {
    return this.http.get<Transaccion>(`${this.baseUrl}/${id}`).pipe(
      switchMap((transaccion: Transaccion) => {
        return this.http.put<Transaccion>(`${this.baseUrl}/${id}/anular`, {
          reintegrarFondos: true,
          razon: 'Anulación solicitada por el usuario',
          transaccion_id: id,
          fecha_anulacion: new Date().toISOString(),
        });
      }),
      map((response: Transaccion) => {
        if (response && (response as Transaccion & { anulada?: boolean }).anulada === true) {
          } else {
          }

        return {
          ...response,
          eliminado: true,
        } as Transaccion;
      }),
      catchError((error: HttpErrorResponse) => {
        throw error;
      })
    );
  }

  eliminarTransaccion(id: string): Observable<Transaccion> {
    return this.http
      .put<Transaccion>(
        `${environment.apiUrl}/finanzas/transacciones/${id}/anular?reintegrar_fondos=true`,
        {
          descripcion: 'Transacción eliminada por el usuario',
        }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          throw error;
        })
      );
  }

  eliminarTransaccionPermanente(id: string): Observable<Transaccion> {
    return this.http
      .put<Transaccion>(`${environment.apiUrl}/finanzas/transacciones/${id}/anular`, {
        reintegrarFondos: true,
        eliminarPermanente: true,
        razon: 'Eliminación permanente solicitada por el usuario',
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          throw error;
        })
      );
  }

  actualizarTransaccion(
    id: string,
    data: Partial<Transaccion>
  ): Observable<Transaccion> {
    return this.http.put<Transaccion>(`${this.baseUrl}/${id}`, data);
  }

  aprobarTransaccion(id: string): Observable<Transaccion> {
    return this.http.put<Transaccion>(`${this.baseUrl}/${id}/aprobar`, {
      estado: 'APROBADA',
    });
  }


  transferenciaCuentaCuenta(data: Partial<Transaccion>): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiUrl}/finanzas/transferencias/cuenta-cuenta`,
      data
    );
  }

  transferenciaCuentaBolsillo(data: Partial<Transaccion>): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiUrl}/finanzas/transferencias/cuenta-bolsillo`,
      data
    );
  }

  transferenciaBolsilloBolsillo(data: Partial<Transaccion>): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiUrl}/finanzas/transferencias/bolsillo-bolsillo`,
      data
    );
  }


  consignacionBancoCuenta(data: Partial<Transaccion>): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiUrl}/finanzas/consignaciones/banco-cuenta`,
      data
    );
  }

  consignacionBancoBolsillo(data: Partial<Transaccion>): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiUrl}/finanzas/consignaciones/banco-bolsillo`,
      data
    );
  }


  retiroCuentaBanco(data: Partial<Transaccion>): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiUrl}/finanzas/retiros/cuenta-banco`,
      data
    );
  }

  retiroBolsilloCuenta(data: Partial<Transaccion>): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiUrl}/finanzas/retiros/bolsillo-cuenta`,
      data
    );
  }

  retiroBolsilloBanco(data: Partial<Transaccion>): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiUrl}/finanzas/retiros/bolsillo-banco`,
      data
    );
  }
}
