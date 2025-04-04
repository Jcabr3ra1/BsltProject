import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private apiGatewayUrl = `${environment.apiGatewayUrl}/seguridad/estados`;

  constructor(private http: HttpClient) {
    console.log('EstadoService inicializado');
    console.log('URL de la API de estados:', this.apiGatewayUrl);
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

  // Obtener todos los estados
  obtenerEstados(): Observable<any[]> {
    console.log('Obteniendo estados desde:', this.apiGatewayUrl);
    return this.http.get<any[]>(this.apiGatewayUrl, this.getHeaders()).pipe(
      tap(estados => {
        console.log('Estados obtenidos:', estados);
      }),
      catchError(error => {
        console.error('Error al obtener estados:', error);
        return throwError(() => new Error('Error al obtener estados'));
      })
    );
  }

  // Obtener un estado por ID
  obtenerEstadoPorId(id: string): Observable<any> {
    console.log('Obteniendo estado por ID desde:', `${this.apiGatewayUrl}/${id}`);
    return this.http.get<any>(`${this.apiGatewayUrl}/${id}`, this.getHeaders()).pipe(
      tap(estado => {
        console.log('Estado obtenido por ID:', estado);
      }),
      catchError(error => {
        console.error('Error al obtener estado por ID:', error);
        return throwError(() => new Error('Error al obtener estado por ID'));
      })
    );
  }

  // Crear un nuevo estado
  crearEstado(estado: any): Observable<any> {
    console.log('Creando estado en:', this.apiGatewayUrl);
    return this.http.post<any>(this.apiGatewayUrl, estado, this.getHeaders()).pipe(
      tap(estadoCreado => {
        console.log('Estado creado:', estadoCreado);
      }),
      catchError(error => {
        console.error('Error al crear estado:', error);
        return throwError(() => new Error('Error al crear estado'));
      })
    );
  }

  // Actualizar un estado
  actualizarEstado(id: string, estado: any): Observable<any> {
    console.log('Actualizando estado en:', `${this.apiGatewayUrl}/${id}`);
    return this.http.put<any>(`${this.apiGatewayUrl}/${id}`, estado, this.getHeaders()).pipe(
      tap(estadoActualizado => {
        console.log('Estado actualizado:', estadoActualizado);
      }),
      catchError(error => {
        console.error('Error al actualizar estado:', error);
        return throwError(() => new Error('Error al actualizar estado'));
      })
    );
  }

  // Eliminar un estado
  eliminarEstado(id: string): Observable<void> {
    console.log('Eliminando estado desde:', `${this.apiGatewayUrl}/${id}`);
    return this.http.delete<void>(`${this.apiGatewayUrl}/${id}`, this.getHeaders()).pipe(
      tap(() => {
        console.log('Estado eliminado');
      }),
      catchError(error => {
        console.error('Error al eliminar estado:', error);
        return throwError(() => new Error('Error al eliminar estado'));
      })
    );
  }
}
