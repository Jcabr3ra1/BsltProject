import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private apiUrl = `${environment.apiUrl}/seguridad/estados`;

  constructor(private http: HttpClient) {}

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
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }

  // Obtener un estado por ID
  obtenerEstadoPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  // Crear un nuevo estado
  crearEstado(estado: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, estado, this.getHeaders());
  }

  // Actualizar un estado
  actualizarEstado(id: string, estado: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, estado, this.getHeaders());
  }

  // Eliminar un estado
  eliminarEstado(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}
