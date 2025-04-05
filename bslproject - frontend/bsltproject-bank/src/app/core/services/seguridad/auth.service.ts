import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { LoginRequest, LoginResponse, Usuario, RegistroRequest } from '@core/models/seguridad/usuario.model';

/**
 * Servicio de autenticación que gestiona el inicio de sesión, registro y verificación de tokens
 * para la aplicación. Mantiene el estado del usuario actual y proporciona observables
 * para que los componentes puedan reaccionar a cambios en el estado de autenticación.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<Usuario | null>(this.getSavedUser());
  public readonly currentUser = this.currentUserSubject.asObservable();
  public readonly isAuthenticated$ = this.currentUser.pipe(map(user => !!user));
  
  private readonly apiUrl = `${environment.apiGatewayUrl}/seguridad/autenticacion`;

  constructor(
    private readonly http: HttpClient, 
    private readonly router: Router
  ) {}

  /**
   * Devuelve el valor actual del usuario autenticado
   */
  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Inicia sesión con las credenciales proporcionadas
   * @param credentials Credenciales de inicio de sesión (email y password)
   * @returns Observable con la respuesta del login que incluye token y datos del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response?.token && response?.user) {
          // Guardar token en localStorage con el formato correcto
          const token = response.token.startsWith('Bearer ') ? response.token : `Bearer ${response.token}`;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Actualizar el BehaviorSubject
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(this.handleError<LoginResponse>('login', 'Error al iniciar sesión'))
    );
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param userData Datos del usuario a registrar
   * @returns Observable con la respuesta del registro
   */
  register(userData: RegistroRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, userData).pipe(
      catchError(this.handleError('registro', 'Error al registrar usuario'))
    );
  }

  /**
   * Verifica si el token actual es válido
   * @returns Observable que emite true si el token es válido, false en caso contrario
   */
  verifyToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(false);
    }
    
    // Formatear el token correctamente para la solicitud
    const tokenForRequest = token.replace('Bearer ', '');
    
    return this.http.post<{ isValid: boolean; user?: Usuario }>(`${this.apiUrl}/verificar-token`, { token: tokenForRequest }).pipe(
      map(response => {
        if (response.isValid && response.user) {
          // Preservar el ID original del usuario si el backend devuelve "temp-id"
          if (response.user.id === 'temp-id') {
            const currentUser = this.currentUserValue;
            if (currentUser?.id && currentUser.id !== 'temp-id') {
              response.user.id = currentUser.id;
            }
          }
          
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
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  /**
   * Cierra la sesión del usuario actual
   * @returns Observable que completa cuando se ha cerrado la sesión
   */
  logout(): Observable<void> {
    return new Observable(observer => {
      this.clearSession();
      observer.next();
      observer.complete();
    });
  }

  /**
   * Obtiene el ID del usuario actual
   * @returns ID del usuario o null si no hay usuario autenticado
   */
  getUserId(): string | null {
    const user = this.currentUserValue;
    return user?.id ?? null;
  }

  /**
   * Verifica y corrige el formato del token si es necesario
   */
  verifyAndFixTokenFormat(): void {
    const token = localStorage.getItem('token');
    if (token && !token.startsWith('Bearer ')) {
      localStorage.setItem('token', `Bearer ${token}`);
    }
  }

  /**
   * Obtiene el token actual de autenticación
   * @returns Token de autenticación o null si no existe
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Obtiene el usuario guardado en localStorage
   * @returns Usuario guardado o null si no existe o hay un error
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
   * Limpia los datos de sesión del usuario
   */
  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  /**
   * Maneja errores HTTP de manera genérica
   * @param operation Nombre de la operación que falló
   * @param result Valor opcional a devolver como observable
   * @returns Función que maneja el error y devuelve un observable
   */
  private handleError<T>(operation = 'operation', defaultErrorMsg = 'Error en la operación') {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} error:`, error);
      
      // Extraer mensaje de error de la respuesta si existe
      const errorMessage = error.error?.message || 
                          error.error?.error || 
                          error.message || 
                          defaultErrorMsg;
      
      return throwError(() => new Error(errorMessage));
    };
  }
}