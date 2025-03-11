import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';
import { HttpService } from '../http/http.service';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private securityApi = API_CONFIG.SECURITY_API;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private httpService: HttpService) {
    console.log('AuthService initialized');
    console.log('Current token exists:', this.hasValidToken());
  }

  /**
   * Inicia sesión con email y contraseña
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Observable con la respuesta del login
   */
  login(email: string, password: string): Observable<LoginResponse> {
    console.log('Login attempt for:', email);
    
    // Usar solo la ruta relativa, no la URL completa
    const endpoint = this.securityApi.AUTH.LOGIN;
    console.log('Using endpoint:', endpoint);
    
    return this.httpService.post<LoginResponse>(endpoint, { email, password }).pipe(
      tap(response => {
        console.log('Login successful, storing tokens');
        console.log('Token received:', response.token ? response.token.substring(0, 15) + '...' : 'No token');
        this.saveTokens(response.token, response.refreshToken || '');
        localStorage.setItem('user', JSON.stringify(response.user));
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Cierra la sesión del usuario actual
   * @returns Observable que completa cuando se cierra la sesión
   */
  logout(): Observable<void> {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
    return of(void 0);
  }

  /**
   * Registra un nuevo usuario
   * @param userData Datos del usuario a registrar
   * @returns Observable con la respuesta del registro
   */
  register(userData: RegisterRequest): Observable<any> {
    console.log('Registering new user:', userData.email);
    
    // Usar solo la ruta relativa, no la URL completa
    const endpoint = this.securityApi.AUTH.REGISTER;
    console.log('Using endpoint:', endpoint);
    
    return this.httpService.post(endpoint, userData);
  }

  /**
   * Refresca el token de autenticación
   * @returns Observable con el nuevo token
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    console.log('Refreshing token');
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      console.error('No refresh token available');
      this.logout();
      throw new Error('No refresh token available');
    }
    
    // Usar solo la ruta relativa, no la URL completa
    const endpoint = this.securityApi.AUTH.REFRESH_TOKEN;
    console.log('Using endpoint:', endpoint);
    
    return this.httpService.post<RefreshTokenResponse>(endpoint, { refreshToken }).pipe(
      tap(response => {
        console.log('Token refreshed successfully');
        console.log('New token:', response.token ? response.token.substring(0, 15) + '...' : 'No token');
        this.saveTokens(response.token, response.refreshToken || '');
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si el usuario está autenticado, false en caso contrario
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Verifica si hay un token válido almacenado
   * @returns true si hay un token válido, false en caso contrario
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Guarda los tokens en el almacenamiento local
   * @param token Token de acceso
   * @param refreshToken Token de refresco
   */
  private saveTokens(token: string, refreshToken: string): void {
    console.log('Saving tokens to localStorage');
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Obtiene el token de acceso almacenado
   * @returns Token de acceso o null si no hay token
   */
  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('Retrieved token from localStorage:', token ? token.substring(0, 15) + '...' : 'No token');
    return token;
  }

  /**
   * Obtiene el token de refresco almacenado
   * @returns Token de refresco o null si no hay token
   */
  getRefreshToken(): string | null {
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('Retrieved refresh token from localStorage:', refreshToken ? refreshToken.substring(0, 15) + '...' : 'No refresh token');
    return refreshToken;
  }

  /**
   * Obtiene el usuario actual
   * @returns Usuario actual o null si no hay usuario
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('No user found in localStorage');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr) as User;
      console.log('Retrieved user from localStorage:', user.email);
      return user;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }
}
