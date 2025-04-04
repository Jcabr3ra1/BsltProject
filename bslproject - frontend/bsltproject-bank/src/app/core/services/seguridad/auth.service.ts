import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'environment/environment';
import { LoginRequest, LoginResponse, Usuario, RegistroRequest } from '@core/models/seguridad/usuario.model';

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
    console.log('Login request with credentials:', credentials);
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (response && response.token && response.user) {
          // Guardar token en localStorage con el formato correcto
          const token = response.token.startsWith('Bearer ') ? response.token : `Bearer ${response.token}`;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Actualizar el BehaviorSubject
          this.currentUserSubject.next(response.user);
          console.log('User logged in successfully:', response.user);
        } else {
          console.error('Invalid login response structure:', response);
        }
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => new Error(error.message || 'Error al iniciar sesión'));
      })
    );
  }

  register(userData: RegistroRequest): Observable<any> {
    console.log('Register request with data:', userData);
    return this.http.post(`${this.apiUrl}/registro`, userData).pipe(
      tap(response => {
        console.log('Register response:', response);
      }),
      catchError(error => {
        console.error('Error en registro:', error);
        return throwError(() => new Error(error.message || 'Error al registrar usuario'));
      })
    );
  }

  verifyToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage');
      return of(false);
    }

    console.log('Verifying token:', token.substring(0, 20) + '...');
    
    // Formatear el token correctamente para la solicitud
    const tokenForRequest = token.replace('Bearer ', '');
    
    return this.http.post<{ isValid: boolean; user?: Usuario }>(`${this.apiUrl}/verificar-token`, { token: tokenForRequest }).pipe(
      map(response => {
        console.log('Token verification response:', response);
        if (response.isValid && response.user) {
          // Actualizar información del usuario
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          return true;
        }
        // Si el token no es válido, limpiar sesión
        if (!response.isValid) {
          this.clearSession();
        }
        return false;
      }),
      catchError(error => {
        console.error('Error al verificar token:', error);
        this.clearSession();
        return of(false);
      })
    );
  }

  logout(): Observable<void> {
    console.log('Logging out user');
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
      console.log('Fixing token format');
      localStorage.setItem('token', `Bearer ${token}`);
    }
  }

  // Método para obtener el token actual
  getToken(): string | null {
    const token = localStorage.getItem('token');
    return token;
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
    console.log('Clearing session data');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}