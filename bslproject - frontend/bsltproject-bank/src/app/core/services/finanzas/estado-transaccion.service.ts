import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { environment } from '@environments/environment';
import { EstadoTransaccion } from '@core/models/finanzas/transaccion.model';

@Injectable({
  providedIn: 'root'
})
export class EstadoTransaccionService {
  // No existe un endpoint específico para estados de transacción en el backend
  // Usaremos valores predefinidos en lugar de intentar obtenerlos del backend
  private apiGatewayUrl = `${environment.apiGatewayUrl}/finanzas/estados-transaccion`;

  constructor(private http: HttpClient) {
    console.log('EstadoTransaccionService inicializado');
    console.log('URL de la API de estados de transacción:', this.apiGatewayUrl);
  }

  // Método para obtener los encabezados con token
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // Obtener todos los estados de transacción
  obtenerEstadosTransaccion(): Observable<EstadoTransaccion[]> {
    console.log('Usando estados de transacción predefinidos');
    
    // Usar los valores del enum EstadoTransaccion
    const estadosPredefinidos: EstadoTransaccion[] = [
      EstadoTransaccion.PENDIENTE,
      EstadoTransaccion.COMPLETADA,
      EstadoTransaccion.ANULADA,
      EstadoTransaccion.RECHAZADA,
      EstadoTransaccion.APROBADA
    ];
    
    console.log('Estados de transacción predefinidos:', estadosPredefinidos);
    return of(estadosPredefinidos).pipe(
      tap(estados => {
        console.log('Estados de transacción proporcionados:', estados);
      }),
      catchError(error => {
        console.error('Error al proporcionar estados de transacción:', error);
        return throwError(() => new Error('Error al proporcionar estados de transacción'));
      })
    );
  }

  // Obtener un estado de transacción por ID
  obtenerEstadoTransaccionPorId(id: string): Observable<EstadoTransaccion> {
    console.log('Obteniendo estado de transacción por ID desde:', `${this.apiGatewayUrl}/${id}`);
    return this.http.get<EstadoTransaccion>(`${this.apiGatewayUrl}/${id}`, this.getHeaders()).pipe(
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
    console.log('Creando estado de transacción en:', this.apiGatewayUrl);
    return this.http.post<EstadoTransaccion>(this.apiGatewayUrl, estado, this.getHeaders()).pipe(
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
    console.log('Actualizando estado de transacción en:', `${this.apiGatewayUrl}/${id}`);
    return this.http.put<EstadoTransaccion>(`${this.apiGatewayUrl}/${id}`, estado, this.getHeaders()).pipe(
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
    console.log('Eliminando estado de transacción desde:', `${this.apiGatewayUrl}/${id}`);
    return this.http.delete<void>(`${this.apiGatewayUrl}/${id}`, this.getHeaders()).pipe(
      tap(() => {
        console.log('Estado de transacción eliminado');
      }),
      catchError(error => {
        console.error('Error al eliminar estado de transacción:', error);
        return throwError(() => new Error('Error al eliminar estado de transacción'));
      })
    );
  }
}
