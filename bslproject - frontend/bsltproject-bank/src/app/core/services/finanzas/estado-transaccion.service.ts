import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { environment } from '@environments/environment';
import { EstadoTransaccion } from '@core/models/finanzas/estado-transaccion.model';
import { BaseApiService } from '@core/services/base-api.service';
import { AuthService } from '@core/services/seguridad/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EstadoTransaccionService extends BaseApiService<EstadoTransaccion> {
  // Endpoint para estados de transacción en el backend
  private apiUrl = `${environment.apiGatewayUrl}/finanzas/estados-transaccion`;

  constructor(
    protected override http: HttpClient,
    protected override authService: AuthService
  ) {
    super(http, environment.apiGatewayUrl, authService);
    console.log('EstadoTransaccionService inicializado');
    console.log('URL de la API de estados de transacción:', this.apiUrl);
  }

  // Obtener todos los estados de transacción
  obtenerEstadosTransaccion(): Observable<EstadoTransaccion[]> {
    console.log('Obteniendo estados de transacción del backend');
    
    return this.http.get<EstadoTransaccion[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(estados => {
        console.log('Estados de transacción obtenidos del backend:', estados);
      }),
      catchError(error => {
        console.error('Error al obtener estados de transacción:', error);
        return throwError(() => new Error('Error al obtener estados de transacción'));
      })
    );
  }

  // Obtener un estado de transacción por ID
  obtenerEstadoTransaccionPorId(id: string): Observable<EstadoTransaccion> {
    console.log('Obteniendo estado de transacción por ID desde:', `${this.apiUrl}/${id}`);
    return this.http.get<EstadoTransaccion>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(estado => {
        console.log('Estado de transacción obtenido por ID:', estado);
      }),
      catchError(error => {
        console.error('Error al obtener estado de transacción por ID:', error);
        return throwError(() => new Error('Error al obtener estado de transacción por ID'));
      })
    );
  }

  // Crear un nuevo estado de transacción
  crearEstadoTransaccion(estado: Partial<EstadoTransaccion>): Observable<EstadoTransaccion> {
    console.log('Creando estado de transacción en:', this.apiUrl);
    return this.http.post<EstadoTransaccion>(this.apiUrl, estado, { headers: this.getHeaders() }).pipe(
      tap(estadoCreado => {
        console.log('Estado de transacción creado:', estadoCreado);
      }),
      catchError(error => {
        console.error('Error al crear estado de transacción:', error);
        return throwError(() => new Error('Error al crear estado de transacción'));
      })
    );
  }

  // Actualizar un estado de transacción
  actualizarEstadoTransaccion(id: string, estado: Partial<EstadoTransaccion>): Observable<EstadoTransaccion> {
    console.log('Actualizando estado de transacción en:', `${this.apiUrl}/${id}`);
    return this.http.put<EstadoTransaccion>(`${this.apiUrl}/${id}`, estado, { headers: this.getHeaders() }).pipe(
      tap(estadoActualizado => {
        console.log('Estado de transacción actualizado:', estadoActualizado);
      }),
      catchError(error => {
        console.error('Error al actualizar estado de transacción:', error);
        return throwError(() => new Error('Error al actualizar estado de transacción'));
      })
    );
  }

  // Eliminar un estado de transacción
  eliminarEstadoTransaccion(id: string): Observable<void> {
    console.log('Eliminando estado de transacción desde:', `${this.apiUrl}/${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => {
        console.log('Estado de transacción eliminado');
      }),
      catchError(error => {
        console.error('Error al eliminar estado de transacción:', error);
        return throwError(() => new Error('Error al eliminar estado de transacción'));
      })
    );
  }

  // Inicializar estados predeterminados
  inicializarEstadosPredeterminados(): Observable<any> {
    console.log('Inicializando estados de transacción predeterminados');
    return this.http.post<any>(`${this.apiUrl}/inicializar`, {}, { headers: this.getHeaders() }).pipe(
      tap(resultado => {
        console.log('Estados de transacción inicializados:', resultado);
      }),
      catchError(error => {
        console.error('Error al inicializar estados de transacción:', error);
        return throwError(() => new Error('Error al inicializar estados de transacción'));
      })
    );
  }
}
