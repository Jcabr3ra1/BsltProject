import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';
import { Rol } from '../../../../../core/models/rol.model'; // Asegúrate de tener un modelo Rol
import { Permiso } from '../../../../../core/models/permiso.model';// Modelo Permiso

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl}/seguridad/roles`);
  }

  getRolById(id: string): Observable<Rol> {
    return this.http.get<Rol>(`${this.baseUrl}/seguridad/roles/${id}`);
  }

  crearRol(rol: Partial<Rol>): Observable<Rol> {
    return this.http.post<Rol>(`${this.baseUrl}/seguridad/roles`, rol);
  }

  actualizarRol(id: string, rol: Partial<Rol>): Observable<Rol> {
    return this.http.put<Rol>(`${this.baseUrl}/seguridad/roles/${id}`, rol);
  }

  eliminarRol(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seguridad/roles/${id}`);
  }

  getPermisosDeRol(idRol: string): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.baseUrl}/seguridad/roles/${idRol}/permisos`);
  }

  asignarPermiso(roleId: string, permissionId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/seguridad/roles/${roleId}/permisos/${permissionId}`, {});
  }

  eliminarPermiso(roleId: string, permissionId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seguridad/roles/${roleId}/permisos/${permissionId}`);
  }

  getUsuariosConRol(idRol: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/seguridad/roles/${idRol}/users`);
  }
}
