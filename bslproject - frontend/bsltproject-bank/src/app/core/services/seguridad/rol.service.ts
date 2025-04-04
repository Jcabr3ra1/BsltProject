import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiGatewayUrl = `${environment.apiGatewayUrl}/seguridad/roles`;

  constructor(private http: HttpClient) {
    console.log('RolService inicializado');
    console.log('URL de la API de roles:', this.apiGatewayUrl);
  }

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
    console.log('Obteniendo roles desde:', this.apiGatewayUrl);
    return this.http.get<any[]>(this.apiGatewayUrl, this.getHeaders()).pipe(
      tap(roles => {
        console.log('Roles obtenidos:', roles);
      }),
      catchError(error => {
        console.error('Error al obtener roles:', error);
        return throwError(() => new Error('Error al obtener roles'));
      })
    );
  }

  // Obtener un rol por ID
  obtenerRolPorId(id: string): Observable<any> {
    console.log('Obteniendo rol por ID desde:', `${this.apiGatewayUrl}/${id}`);
    return this.http.get<any>(`${this.apiGatewayUrl}/${id}`, this.getHeaders()).pipe(
      tap(rol => {
        console.log('Rol obtenido por ID:', rol);
      }),
      catchError(error => {
        console.error('Error al obtener rol por ID:', error);
        return throwError(() => new Error('Error al obtener rol por ID'));
      })
    );
  }

  // Obtener un rol por nombre
  obtenerRolPorNombre(nombre: string): Observable<any> {
    console.log('Obteniendo rol por nombre desde:', `${this.apiGatewayUrl}/nombre/${nombre}`);
    return this.http.get<any>(`${this.apiGatewayUrl}/nombre/${nombre}`, this.getHeaders()).pipe(
      tap(rol => {
        console.log('Rol obtenido por nombre:', rol);
      }),
      catchError(error => {
        console.error('Error al obtener rol por nombre:', error);
        return throwError(() => new Error('Error al obtener rol por nombre'));
      })
    );
  }

  // Obtener permisos de un rol
  obtenerPermisosDeRol(id: string): Observable<any> {
    console.log('Obteniendo permisos de rol desde:', `${this.apiGatewayUrl}/${id}/permisos`);
    return this.http.get<any>(`${this.apiGatewayUrl}/${id}/permisos`, this.getHeaders()).pipe(
      tap(permisos => {
        console.log('Permisos de rol obtenidos:', permisos);
      }),
      catchError(error => {
        console.error('Error al obtener permisos de rol:', error);
        return throwError(() => new Error('Error al obtener permisos de rol'));
      })
    );
  }

  // Obtener usuarios asociados a un rol
  obtenerUsuariosConRol(id: string): Observable<any> {
    console.log('Obteniendo usuarios con rol desde:', `${this.apiGatewayUrl}/${id}/usuarios`);
    return this.http.get<any>(`${this.apiGatewayUrl}/${id}/usuarios`, this.getHeaders()).pipe(
      tap(usuarios => {
        console.log('Usuarios con rol obtenidos:', usuarios);
      }),
      catchError(error => {
        console.error('Error al obtener usuarios con rol:', error);
        return throwError(() => new Error('Error al obtener usuarios con rol'));
      })
    );
  }

  // Crear un nuevo rol
  crearRol(rol: any): Observable<any> {
    console.log('Creando rol en:', this.apiGatewayUrl);
    return this.http.post<any>(this.apiGatewayUrl, rol, this.getHeaders()).pipe(
      tap(rolCreado => {
        console.log('Rol creado:', rolCreado);
      }),
      catchError(error => {
        console.error('Error al crear rol:', error);
        return throwError(() => new Error('Error al crear rol'));
      })
    );
  }

  // Actualizar un rol existente
  actualizarRol(id: string, rol: any): Observable<any> {
    console.log('Actualizando rol en:', `${this.apiGatewayUrl}/${id}`);
    return this.http.put<any>(`${this.apiGatewayUrl}/${id}`, rol, this.getHeaders()).pipe(
      tap(rolActualizado => {
        console.log('Rol actualizado:', rolActualizado);
      }),
      catchError(error => {
        console.error('Error al actualizar rol:', error);
        return throwError(() => new Error('Error al actualizar rol'));
      })
    );
  }

  // Eliminar un rol
  eliminarRol(id: string): Observable<void> {
    console.log('Eliminando rol desde:', `${this.apiGatewayUrl}/${id}`);
    return this.http.delete<void>(`${this.apiGatewayUrl}/${id}`, this.getHeaders()).pipe(
      tap(() => {
        console.log('Rol eliminado');
      }),
      catchError(error => {
        console.error('Error al eliminar rol:', error);
        return throwError(() => new Error('Error al eliminar rol'));
      })
    );
  }
}
