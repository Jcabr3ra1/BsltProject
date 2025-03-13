import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpService } from '../http/http.service';
import { User, Role, State, RegistroRequest, LoginRequest, LoginResponse, RegistroResponse } from '../../models/seguridad/usuario.model';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl = `${API_CONFIG.API_GATEWAY_URL}/seguridad/autenticacion`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private readonly httpService: HttpService) {
    // Initialize auth state from localStorage
    this.updateAuthenticationState(this.hasValidToken());
  }

  /**
   * Login user
   * @param email User's email
   * @param password User's password
   * @returns Observable<LoginResponse>
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const credentials: LoginRequest = { email, password };
    
    console.log('Enviando petición de login a:', `${this.authUrl}/login`);
    
    return this.httpService.post<LoginResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('Respuesta de login recibida:', response);
        this.saveToken(response.token);
        if (response.usuario) {
          this.saveUser(response.usuario);
        }
        this.updateAuthenticationState(true);
      }),
      catchError(error => {
        console.error('Error en servicio de autenticación:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Register new user
   * @param userData RegistroRequest
   * @returns Observable<RegistroResponse>
   */
  register(userData: RegistroRequest): Observable<RegistroResponse> {
    return this.httpService.post<RegistroResponse>(`${this.authUrl}/registro`, userData).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   * @returns Observable<void>
   */
  logout(): Observable<void> {
    console.log('Cerrando sesión');
    // Simplemente limpiamos los datos locales sin llamadas al servidor
    this.clearAuthData();
    return of(void 0);
  }

  /**
   * Check if user is authenticated
   * @returns true if user is authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Get current user from local storage
   * @returns User | null
   */
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Get authentication token from local storage
   * @returns string | null
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Save token to local storage
   * @param token Authentication token
   */
  private saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Save user to local storage
   * @param user User data
   */
  private saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear all authentication data from local storage
   */
  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.updateAuthenticationState(false);
  }

  /**
   * Update authentication state
   * @param isAuthenticated Boolean indicating if user is authenticated
   */
  private updateAuthenticationState(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  /**
   * Check if there is a valid token
   * @returns boolean
   */
  private hasValidToken(): boolean {
    return !!this.getToken();
  }
}
