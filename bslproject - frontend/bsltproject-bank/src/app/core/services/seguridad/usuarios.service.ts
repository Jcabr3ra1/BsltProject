import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User, Role, State, RegistroRequest } from '../../models/seguridad/usuario.model';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly baseUrl = API_CONFIG.SECURITY_API.USERS.BASE;
  private readonly rolesUrl = API_CONFIG.SECURITY_API.ROLES.BASE;
  private readonly statesUrl = `${API_CONFIG.SECURITY_API.BASE_URL}/estados`;
  private readonly authUrl = `${API_CONFIG.SECURITY_API.BASE_URL}/autenticacion`;

  constructor(private readonly http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any, operation: string): Observable<never> {
    console.error(`Error detallado en ${operation}:`, error);
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.status} - ${error.error?.message || error.statusText}`;
      console.error('Error completo:', JSON.stringify(error));
      console.error('Error status:', error.status);
      console.error('Error statusText:', error.statusText);
      console.error('Error headers:', error.headers);
      console.error('Error error:', error.error);
      console.error('Error message:', error.message);
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // User management endpoints
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'getUsers'))
    );
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'getUser'))
    );
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.baseUrl, user, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'createUser'))
    );
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'updateUser'))
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'deleteUser'))
    );
  }

  // Role management endpoints
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesUrl, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'getRoles'))
    );
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.rolesUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'getRole'))
    );
  }

  assignRole(userId: string, roleId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/roles/${roleId}`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'assignRole'))
    );
  }

  // State management endpoints
  getStates(): Observable<State[]> {
    return this.http.get<State[]>(this.statesUrl, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'getStates'))
    );
  }

  getState(id: string): Observable<State> {
    return this.http.get<State>(`${this.statesUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'getState'))
    );
  }

  assignState(userId: string, stateId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/estados/${stateId}`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'assignState'))
    );
  }
}
