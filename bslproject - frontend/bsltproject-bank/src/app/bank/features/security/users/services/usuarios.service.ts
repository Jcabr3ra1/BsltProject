import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/seguridad/usuarios`);
  }

  getCuentas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/finanzas/cuentas`);
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/seguridad/roles`);
  }
  
  getEstados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/seguridad/estados`);
  }
  
  crearUsuario(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/seguridad/autenticacion/registro`, data);
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seguridad/usuarios/${id}`);
  }

  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/usuarios`);
  }
  
  
  actualizarUsuario(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/seguridad/usuarios/${id}`, data);
  }
  
  
}
