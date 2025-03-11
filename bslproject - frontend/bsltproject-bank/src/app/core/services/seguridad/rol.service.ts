import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = `${environment.apiUrl}/seguridad/roles`;

  constructor(private http: HttpClient) {}

  // Método para obtener los headers con el token
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // Obtener todos los roles
  obtenerRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders()); // GET `/seguridad/roles`
  }

  // Obtener un rol por ID
  obtenerRolPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHeaders()); // GET `/seguridad/roles/{id}`
  }

  // Obtener un rol por nombre
  obtenerRolPorNombre(nombre: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/nombre/${nombre}`, this.getHeaders()); // GET `/seguridad/roles/nombre/{nombre}`
  }

  // Obtener permisos de un rol
  obtenerPermisosDeRol(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/permisos`, this.getHeaders()); // GET `/seguridad/roles/{id}/permisos`
  }

  // Obtener usuarios asociados a un rol
  obtenerUsuariosConRol(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/usuarios`, this.getHeaders()); // GET `/seguridad/roles/{id}/usuarios`
  }

  // Crear un nuevo rol
  crearRol(rol: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, rol, this.getHeaders()); // POST `/seguridad/roles`
  }

  // Actualizar un rol existente
  actualizarRol(id: string, rol: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, rol, this.getHeaders()); // PUT `/seguridad/roles/{id}`
  }

  // Eliminar un rol
  eliminarRol(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders()); // DELETE `/seguridad/roles/{id}`
  }
}
