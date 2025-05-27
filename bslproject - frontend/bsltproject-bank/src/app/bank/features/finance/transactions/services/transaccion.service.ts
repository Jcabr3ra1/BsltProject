import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  // ------------------ CRUD GENERAL ------------------

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

  crearTransaccion(transaccion: Transaccion): Observable<any> {
    return this.http.post(this.baseUrl, transaccion);
  }

  anularTransaccion(id: string): Observable<any> {
    console.log(`Enviando solicitud de anulación para la transacción ${id}`);
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      switchMap((transaccion: any) => {
        console.log('Transacción encontrada:', transaccion);

        return this.http.put<any>(`${this.baseUrl}/${id}/anular`, {
          reintegrarFondos: true,
          razon: 'Anulación solicitada por el usuario',
          transaccion_id: id,
          fecha_anulacion: new Date().toISOString(),
        });
      }),
      map((response: any) => {
        console.log('Respuesta del servidor para anulación:', response);

        if (response && response.anulada === true) {
          console.log('Anulación exitosa, fondos reintegrados');
        } else {
          console.warn('La anulación no confirmó el reintegro de fondos');
        }

        return {
          ...response,
          eliminado: true,
        };
      }),
      catchError((error: any) => {
        console.error('Error en la anulación de la transacción:', error);
        throw error;
      })
    );
  }

  eliminarTransaccion(id: string): Observable<any> {
    console.log(`Marcando transacción ${id} como ELIMINADA`);

    return this.http
      .put(
        `${environment.apiUrl}/finanzas/transacciones/${id}/anular?reintegrar_fondos=true`,
        {
          descripcion: 'Transacción eliminada por el usuario',
        }
      )
      .pipe(
        catchError((error: any) => {
          console.error('Error al eliminar la transacción:', error);
          throw error;
        })
      );
  }

  eliminarTransaccionPermanente(id: string): Observable<any> {
    console.log(
      `Eliminando permanentemente la transacción ${id} de la base de datos`
    );

    return this.http
      .put(`${environment.apiUrl}/finanzas/transacciones/${id}/anular`, {
        reintegrarFondos: true,
        eliminarPermanente: true,
        razon: 'Eliminación permanente solicitada por el usuario',
      })
      .pipe(
        catchError((error: any) => {
          console.error(
            'Error al eliminar permanentemente la transacción:',
            error
          );
          throw error;
        })
      );
  }

  actualizarTransaccion(
    id: string,
    data: Partial<Transaccion>
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  aprobarTransaccion(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/aprobar`, {
      estado: 'APROBADA',
    });
  }

  // ------------------ TRANSFERENCIAS ------------------

  transferenciaCuentaCuenta(data: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/finanzas/transferencias/cuenta-cuenta`,
      data
    );
  }

  transferenciaCuentaBolsillo(data: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/finanzas/transferencias/cuenta-bolsillo`,
      data
    );
  }

  transferenciaBolsilloBolsillo(data: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/finanzas/transferencias/bolsillo-bolsillo`,
      data
    );
  }

  // ------------------ CONSIGNACIONES (Banco → sistema) ------------------

  consignacionBancoCuenta(data: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/finanzas/consignaciones/banco-cuenta`,
      data
    );
  }

  consignacionBancoBolsillo(data: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/finanzas/consignaciones/banco-bolsillo`,
      data
    );
  }

  // ------------------ RETIROS (Sistema → banco) ------------------

  retiroCuentaBanco(data: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/finanzas/retiros/cuenta-banco`,
      data
    );
  }

  retiroBolsilloCuenta(data: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/finanzas/retiros/bolsillo-cuenta`,
      data
    );
  }

  retiroBolsilloBanco(data: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/finanzas/retiros/bolsillo-banco`,
      data
    );
  }
}
