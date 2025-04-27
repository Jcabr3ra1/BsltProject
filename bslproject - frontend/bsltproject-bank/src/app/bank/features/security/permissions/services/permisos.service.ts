import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';
import { Permiso } from '../../../../../core/models/permiso.model';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ✅ Obtener todos los permisos
  getPermisos(): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.baseUrl}/seguridad/permisos`);
  }

  // ✅ Obtener un permiso por ID
  getPermisoById(id: string): Observable<Permiso> {
    return this.http.get<Permiso>(`${this.baseUrl}/seguridad/permisos/${id}`);
  }

  // ✅ Crear nuevo permiso
  crearPermiso(permiso: Partial<Permiso>): Observable<Permiso> {
    return this.http.post<Permiso>(`${this.baseUrl}/seguridad/permisos`, permiso);
  }

  // ✅ Actualizar permiso
  actualizarPermiso(id: string, permiso: Partial<Permiso>): Observable<Permiso> {
    return this.http.put<Permiso>(`${this.baseUrl}/seguridad/permisos/${id}`, permiso);
  }

  // ✅ Eliminar permiso
  eliminarPermiso(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/seguridad/permisos/${id}`);
  }

  // ✅ Buscar permiso por nombre
  getPermisoByNombre(nombre: string): Observable<Permiso> {
    return this.http.get<Permiso>(`${this.baseUrl}/seguridad/permisos/nombre/${nombre}`);
  }
}
