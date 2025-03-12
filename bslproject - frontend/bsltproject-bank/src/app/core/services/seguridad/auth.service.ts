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
  private readonly authUrl = API_CONFIG.SECURITY_API.AUTH;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private readonly httpService: HttpService) {}

  /**
   * Login user
   * @param email User's email
   * @param password User's password
   * @returns Observable<LoginResponse>
   */
  login(email: string, password: string): Observable<LoginResponse> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const credentials: LoginRequest = { email, password };

    return this.httpService.post<LoginResponse>(this.authUrl.LOGIN, credentials).pipe(
      tap(response => {
        console.log('Login response received:', response);
        if (!response || !response.token) {
          throw new Error('Invalid login response from server');
        }

        if (response.token && response.refreshToken) {
          console.log('Tokens received from server:', { token: response.token, refreshToken: response.refreshToken });
          console.log('Saving tokens...');
          this.saveTokens(response.token, response.refreshToken);
          
          // Then save user if available
          if (response.user) {
            console.log('Saving user data...');
            this.saveUser(response.user);
          }

          console.log('Updating authentication state...');
          this.updateAuthenticationState(true);
        }
      }),
      catchError(error => this.handleError(error, 'login'))
    );
  }

  /**
   * Register new user
   * @param userData RegistroRequest
   * @returns Observable<RegistroResponse>
   */
  register(userData: RegistroRequest): Observable<RegistroResponse> {
    return this.httpService.post<RegistroResponse>(this.authUrl.REGISTER, userData).pipe(
      catchError(error => this.handleError(error, 'register'))
    );
  }

  /**
   * Logout user
   * @returns Observable<void>
   */
  logout(): Observable<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user_backup');
    this.isAuthenticatedSubject.next(false);
    return of(void 0);
  }

  /**
   * Refresh authentication token
   * @returns Observable<RefreshTokenResponse>
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }
    
    return this.httpService.post<LoginResponse>(this.authUrl.REFRESH, { refreshToken }).pipe(
      tap(response => {
        if (response.token && response.refreshToken) {
          this.saveTokens(response.token, response.refreshToken);
        }
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => this.handleError(error, 'refreshToken'))
    );
  }

  /**
   * Check if user is authenticated
   * @returns true if user is authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Get the current user from storage
   * @returns The current user or null if not found
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        const backupStr = sessionStorage.getItem('user_backup');
        if (backupStr) {
          const user = JSON.parse(backupStr);
          this.saveUser(user);
          return user;
        }
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Get the current authentication token
   * @returns The current token or null if not found
   */
  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('Retrieving token from localStorage:', token);
    return token;
  }

  /**
   * Get the current refresh token
   * @returns The current refresh token or null if not found
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Check if there is a valid token stored
   * @returns true if there is a valid token, false otherwise
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Save tokens to local storage
   * @param token Access token
   * @param refreshToken Refresh token
   */
  private saveTokens(token: string, refreshToken: string): void {
    console.log('Saving tokens:', { token, refreshToken });
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Save user to localStorage with additional validation
   * @param user User to save
   */
  private saveUser(user: User): void {
    if (!user || typeof user !== 'object' || !user.email) {
      throw new Error(`Cannot save invalid user data: ${JSON.stringify(user)}`);
    }

    try {
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('user_backup', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('Failed to save user data to storage');
    }
  }

  private updateAuthenticationState(isAuthenticated: boolean): void {
    console.log('Current authentication state:', this.isAuthenticatedSubject.value);
    console.log('New authentication state:', isAuthenticated);
    this.isAuthenticatedSubject.next(isAuthenticated);
    console.log('Authentication state updated');
  }

  /**
   * Handle HTTP errors
   * @param error Error object
   * @param operation Name of the operation that failed
   * @returns Observable with error
   */
  private handleError(error: any, operation: string): Observable<never> {
    console.error(`Error in ${operation}:`, error);
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
