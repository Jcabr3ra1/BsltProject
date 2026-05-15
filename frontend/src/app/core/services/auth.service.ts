import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = environment.apiUrl;

  login(credentials: { email: string; password: string }): Observable<{token: string; user: Usuario}> {
    return this.http.post<{token: string; user: Usuario}>(`${this.baseUrl}/seguridad/autenticacion/login`, credentials).pipe(
      tap((response: {token: string; user: Usuario}) => {
        const token = response?.token;
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(response?.user || {}));
          this.router.navigateByUrl('/dashboard'); // 🔁 redirige aquí
        }
      })
    );
  }
  

  register(data: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
  }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/seguridad/autenticacion/registro`, data);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigateByUrl('/auth/login');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): Usuario | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  httpOptionsWithAuth(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token'); // O ajusta según cómo almacenes el token
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }
  
}
