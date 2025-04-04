import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Usuario } from '@core/models/seguridad/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = `${environment.apiGatewayUrl}/seguridad/usuarios`;

  constructor(private http: HttpClient) { }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  obtenerTodos(): Observable<Usuario[]> {
    console.log('Obteniendo todos los usuarios desde:', this.baseUrl);
    
    return this.http.get<Usuario[]>(
      this.baseUrl,
      this.getHeaders()
    ).pipe(
      tap(usuarios => console.log('Usuarios obtenidos:', usuarios)),
      catchError(error => {
        console.error('Error al obtener usuarios:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerPorId(id: string): Observable<Usuario> {
    console.log(`Obteniendo usuario con ID ${id} desde: ${this.baseUrl}/${id}`);
    
    return this.http.get<Usuario>(
      `${this.baseUrl}/${id}`,
      this.getHeaders()
    ).pipe(
      tap(usuario => console.log('Usuario obtenido:', usuario)),
      catchError(error => {
        console.error(`Error al obtener usuario con ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}
