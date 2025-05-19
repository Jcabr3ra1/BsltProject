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
    return this.http.get<Transaccion[]>(`${this.baseUrl}/usuario/${id_usuario}`);
  }

  getProximosPagos(id_usuario: string): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(`${this.baseUrl}/usuario/${id_usuario}/proximos-pagos`);
  }

  crearTransaccion(transaccion: Transaccion): Observable<any> {
    return this.http.post(this.baseUrl, transaccion);
  }

  /**
   * Anula una transacción y reintegra los fondos a las cuentas/bolsillos correspondientes
   * @param id ID de la transacción a anular
   * @returns Observable con la respuesta del servidor
   */
  anularTransaccion(id: string): Observable<any> {
    console.log(`Enviando solicitud de anulación para la transacción ${id}`);
    
    // Primero obtenemos los detalles de la transacción para asegurarnos de que existe
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      switchMap((transaccion: any) => {
        console.log('Transacción encontrada:', transaccion);
        
        // Ahora enviamos la solicitud de anulación con los detalles completos
        return this.http.put<any>(`${this.baseUrl}/${id}/anular`, {
          reintegrarFondos: true,
          razon: 'Anulación solicitada por el usuario',
          // Incluimos detalles adicionales que podrían ser útiles para el backend
          transaccion_id: id,
          fecha_anulacion: new Date().toISOString()
        });
      }),
      map((response: any) => {
        console.log('Respuesta del servidor para anulación:', response);
        
        // Verificamos si la anulación fue exitosa
        if (response && response.anulada === true) {
          console.log('Anulación exitosa, fondos reintegrados');
        } else {
          console.warn('La anulación no confirmó el reintegro de fondos');
        }
        
        return {
          ...response,
          eliminado: true // Marcador para que el frontend sepa que debe eliminar esta transacción de la lista
        };
      }),
      catchError((error: any) => {
        console.error('Error en la anulación de la transacción:', error);
        throw error;
      })
    );
  }

  /**
   * Marca una transacción como eliminada en el backend
   * @param id ID de la transacción a eliminar
   * @returns Observable con la respuesta del servidor
   */
  eliminarTransaccion(id: string): Observable<any> {
    console.log(`Marcando transacción ${id} como ELIMINADA`);
    
    // Usamos el endpoint de anulación con el parámetro reintegrar_fondos=true
    // para asegurar que se reintegre el dinero a la cuenta/bolsillo de origen
    return this.http.put(`${environment.apiUrl}/finanzas/transacciones/${id}/anular?reintegrar_fondos=true`, {
      descripcion: 'Transacción eliminada por el usuario'
    }).pipe(
      catchError((error: any) => {
        console.error('Error al eliminar la transacción:', error);
        throw error;
      })
    );
  }
  
  /**
   * Elimina permanentemente una transacción de la base de datos
   * @param id ID de la transacción a eliminar permanentemente
   * @returns Observable con la respuesta del servidor
   */
  eliminarTransaccionPermanente(id: string): Observable<any> {
    console.log(`Eliminando permanentemente la transacción ${id} de la base de datos`);
    
    // Volvemos a usar el método DELETE para eliminar completamente la transacción
    // Esto debe coincidir con el endpoint en el backend que usa @router.delete("/{id}")
    return this.http.delete(`${environment.apiUrl}/finanzas/transacciones/${id}`).pipe(
      catchError((error: any) => {
        console.error('Error al eliminar permanentemente la transacción:', error);
        throw error;
      })
    );
  }

  actualizarTransaccion(id: string, data: Partial<Transaccion>): Observable<any> {
    // Volvemos a usar PUT ya que el backend está configurado para aceptar PUT
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }
  
  aprobarTransaccion(id: string): Observable<any> {
    // Usamos la URL completa para asegurar que se dirija correctamente
    return this.http.put(`${this.baseUrl}/${id}/aprobar`, {
      estado: 'APROBADA'
    });
  }

  // ------------------ TRANSFERENCIAS ------------------

  transferenciaCuentaCuenta(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/transferencias/cuenta-cuenta`, data);
  }

  transferenciaCuentaBolsillo(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/transferencias/cuenta-bolsillo`, data);
  }

  transferenciaBolsilloBolsillo(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/finanzas/transferencias/bolsillo-bolsillo`, data);
  }

  // ------------------ CONSIGNACIONES (Banco → sistema) ------------------

  consignacionBancoCuenta(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/consignaciones/banco-cuenta`, data);
  }

  consignacionBancoBolsillo(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/consignaciones/banco-bolsillo`, data);
  }

  // ------------------ RETIROS (Sistema → banco) ------------------

  retiroCuentaBanco(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/retiros/cuenta-banco`, data);
  }

  retiroBolsilloCuenta(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/retiros/bolsillo-cuenta`, data);
  }

  retiroBolsilloBanco(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/finanzas/retiros/bolsillo-banco`, data);
  }
}
