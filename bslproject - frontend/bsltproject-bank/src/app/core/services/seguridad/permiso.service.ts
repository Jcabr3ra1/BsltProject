import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
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

  // OBTENER TODOS LOS PERMISOS
  obtenerPermisos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/seguridad/permisos`, this.getHeaders());
  }

  // OBTENER TODOS LOS ROLES
  obtenerRoles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/seguridad/roles`, this.getHeaders());
  }

  // CREAR UN NUEVO PERMISO
  crearPermiso(permiso: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/seguridad/permisos`, permiso, this.getHeaders());
  }

  // ACTUALIZAR UN PERMISO
  actualizarPermiso(id: string, permiso: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/seguridad/permisos/${id}`, permiso, this.getHeaders());
  }

  // ELIMINAR UN PERMISO
  eliminarPermiso(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/seguridad/permisos/${id}`, this.getHeaders());
  }

  // ASIGNAR PERMISO A UN ROL (MÉTODO CORRECTO)
  asignarPermisoARol(permisoId: string, rolId: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/seguridad/permisos/${permisoId}/asignar-a-rol/${rolId}`,
      {}, // No se envía cuerpo, los IDs están en la URL
      this.getHeaders()
    );
  }
}
