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

  // ✅ Obtener todos los roles
  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.baseUrl}/seguridad/roles`);
  }

  // ✅ Obtener un rol por ID
  getRolById(id: string): Observable<Rol> {
    return this.http.get<Rol>(`${this.baseUrl}/seguridad/roles/${id}`);
  }

  // ✅ Crear un nuevo rol
  crearRol(rol: Partial<Rol>): Observable<Rol> {
    return this.http.post<Rol>(`${this.baseUrl}/seguridad/roles`, rol);
  }

  // ✅ Actualizar un rol existente
  actualizarRol(id: string, rol: Partial<Rol>): Observable<Rol> {
    return this.http.put<Rol>(`${this.baseUrl}/seguridad/roles/${id}`, rol);
  }

  // ✅ Eliminar un rol
  eliminarRol(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seguridad/roles/${id}`);
  }

  // ✅ Obtener permisos asignados a un rol
  getPermisosDeRol(idRol: string): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.baseUrl}/seguridad/roles/${idRol}/permisos`);
  }

  // ✅ Asignar un permiso a un rol
  asignarPermiso(roleId: string, permissionId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/seguridad/roles/${roleId}/permisos/${permissionId}`, {});
  }

  // ✅ Eliminar un permiso de un rol
  eliminarPermiso(roleId: string, permissionId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seguridad/roles/${roleId}/permisos/${permissionId}`);
  }

  // ✅ Obtener usuarios que tienen un rol
  getUsuariosConRol(idRol: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/seguridad/roles/${idRol}/users`);
  }
}
