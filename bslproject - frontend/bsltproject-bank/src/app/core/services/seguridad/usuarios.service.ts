import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  obtenerUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/seguridad/usuarios`, this.getHeaders());
  }

  obtenerRoles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/seguridad/roles`, this.getHeaders());
  }

  obtenerEstados(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/seguridad/estados`, this.getHeaders());
  }
  
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/seguridad/usuarios/${id}`, this.getHeaders());
  }

  asignarRol(userId: string, rolId: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/seguridad/usuarios/${userId}/asignar-rol/${rolId}`, 
      {},
      this.getHeaders()
    );
  }
  
  asignarEstado(userId: string, estadoId: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/seguridad/usuarios/${userId}/asignar-estado/${estadoId}`, 
      {}, // No se envía cuerpo porque los IDs van en la URL
      this.getHeaders()
    );
  }

  actualizarUsuario(usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/seguridad/usuarios/${usuario.id}`, usuario, this.getHeaders());
  }
}
