import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
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
  
  // Ajustar las rutas para usar tu API Gateway
  private baseUrl = 'http://localhost:7777';
  private authUrl = `${this.baseUrl}/seguridad/autenticacion`;

  constructor(private http: HttpClient, private router: Router) {
    // Intentar recuperar el usuario del almacenamiento local
    const savedUser = this.getSavedUser();
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(savedUser);
    this.currentUser = this.currentUserSubject.asObservable();
    this.isAuthenticated$ = this.currentUser.pipe(map(user => !!user));
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Intenta obtener el usuario guardado en localStorage
   */
  private getSavedUser(): Usuario | null {
    try {
      const userJson = localStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error al parsear usuario guardado:', error);
      return null;
    }
  }

  /**
   * Inicia sesión con las credenciales proporcionadas
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/seguridad/autenticacion/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        }
      }),
      catchError(this.handleAuthError)
    );
  }

  /**
   * Registra un nuevo usuario
   */
  register(userData: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/seguridad/autenticacion/registro`,
      userData
    ).pipe(
      catchError(this.handleAuthError)
    );
  }

  /**
   * Verifica si el token actual es válido
   */
  verifyToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.currentUserSubject.next(null);
      return of(false);
    }

    return this.http.post<{ isValid: boolean; user?: Usuario }>(
      `${this.baseUrl}/seguridad/autenticacion/verificar-token`,
      { token }
    ).pipe(
      tap(response => {
        if (response.isValid && response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        } else if (!response.isValid) {
          this.clearSession();
        }
      }),
      map(response => response.isValid),
      catchError(error => {
        console.error('Error verificando token:', error);
        this.clearSession();
        return of(false);
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): Observable<void> {
    return new Observable(observer => {
      try {
        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Actualizar el estado de autenticación
        this.currentUserSubject.next(null);
        
        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  /**
   * Limpia los datos de sesión del usuario
   */
  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  /**
   * Maneja errores de autenticación
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error de autenticación';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Credenciales inválidas';
      } else if (error.status === 403) {
        errorMessage = 'No tiene permisos para acceder';
      } else if (error.status === 409) {
        errorMessage = 'El usuario ya existe';
      } else if (error.status === 404) {
        errorMessage = 'Servicio no disponible';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtiene el token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}