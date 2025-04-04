// src/app/core/services/seguridad/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { LoginRequest, LoginResponse, Usuario } from '@core/models/seguridad/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser: Observable<Usuario | null>;
  public isAuthenticated$: Observable<boolean>;
  
  private apiUrl = `${environment.apiGatewayUrl}/seguridad/autenticacion`;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(this.getSavedUser());
    this.currentUser = this.currentUserSubject.asObservable();
    this.isAuthenticated$ = this.currentUser.pipe(map(user => !!user));
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token && response.user) {
          // Guardar token en localStorage
          const token = response.token.startsWith('Bearer ') ? response.token : `Bearer ${response.token}`;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Actualizar el BehaviorSubject
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => new Error(error.message || 'Error al iniciar sesión'));
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, userData).pipe(
      catchError(error => {
        console.error('Error en registro:', error);
        return throwError(() => new Error(error.message || 'Error al registrar usuario'));
      })
    );
  }

  verifyToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(false);
    }

    return this.http.post<{ isValid: boolean; user?: Usuario }>(`${this.apiUrl}/verificar-token`, { token }).pipe(
      map(response => {
        if (response.isValid && response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          return true;
        }
        return false;
      }),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  logout(): Observable<void> {
    return new Observable(observer => {
      this.clearSession();
      observer.next();
      observer.complete();
    });
  }

  getUserId(): string | null {
    const user = this.currentUserValue;
    return user ? user.id : null;
  }

  verifyAndFixTokenFormat(): void {
    const token = localStorage.getItem('token');
    if (token && !token.startsWith('Bearer ')) {
      localStorage.setItem('token', `Bearer ${token}`);
    }
  }

  private getSavedUser(): Usuario | null {
    try {
      const userJson = localStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error al parsear usuario guardado:', error);
      return null;
    }
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}