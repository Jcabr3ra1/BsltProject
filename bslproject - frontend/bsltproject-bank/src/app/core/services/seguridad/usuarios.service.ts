import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User, Role, State, RegistroRequest } from '../../models/seguridad/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly baseUrl = `${environment.securityUrl}/users`;
  private readonly rolesUrl = `${environment.securityUrl}/roles`;
  private readonly statesUrl = `${environment.securityUrl}/states`;
  private readonly authUrl = `${environment.securityUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

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

  updateState(userId: string, stateId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/states/${stateId}`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => this.handleError(error, 'updateState'))
    );
  }
}
