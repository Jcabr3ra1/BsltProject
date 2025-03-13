import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '@environments/environment';
import { LoginRequest, LoginResponse, Usuario, RegistroRequest } from '@core/models/seguridad/usuario.model';
import { API_CONFIG } from '@core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser: Observable<Usuario | null>;
  public isAuthenticated$: Observable<boolean>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    this.isAuthenticated$ = this.currentUser.pipe(map(user => !!user));
    this.checkInitialAuth();
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('Intentando iniciar sesión en:', `${environment.apiUrl}${API_CONFIG.AUTH_API.LOGIN}`);
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}${API_CONFIG.AUTH_API.LOGIN}`,
      credentials
    ).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          if (response.user) {
            this.currentUserSubject.next(response.user);
          }
        }
      }),
      catchError(this.handleAuthError)
    );
  }

  register(userData: RegistroRequest): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}${API_CONFIG.AUTH_API.REGISTER}`,
      userData
    ).pipe(
      catchError(this.handleAuthError)
    );
  }

  verifyToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(false);
    }

    return this.http.post<{ isValid: boolean; user?: Usuario }>(
      `${environment.apiUrl}${API_CONFIG.AUTH_API.VERIFY_TOKEN}`,
      { token }
    ).pipe(
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      }),
      map(response => response.isValid),
      catchError(error => {
        console.error('Error verificando token:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.clearSession();
      return of(void 0);
    }

    return this.http.post<void>(
      `${environment.apiUrl}${API_CONFIG.AUTH_API.LOGOUT}`,
      { token }
    ).pipe(
      tap(() => this.clearSession()),
      catchError(error => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/autenticacion/login']);
  }

  getCurrentUser(): Observable<Usuario | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(null);
    }

    return this.verifyToken().pipe(
      switchMap(() => this.currentUser)
    );
  }

  private checkInitialAuth(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.verifyToken().subscribe({
        next: (isValid) => {
          if (!isValid) {
            this.logout();
          }
        },
        error: (error) => {
          console.error('Error verificando token:', error);
          this.logout();
        }
      });
    }
  }

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

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getClientId(): string | null {
    return localStorage.getItem('clientId');
  }

  getSessionId(): string | null {
    return localStorage.getItem('sessionId');
  }
}
