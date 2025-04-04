// src/app/core/services/base-api.service.ts
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class BaseApiService<T> {
  constructor(
    protected http: HttpClient,
    protected baseUrl: string
  ) {}

  protected getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''
    });
  }

  obtenerTodos(): Observable<T[]> {
    return this.http.get<T[]>(this.baseUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  obtenerPorId(id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  crear(item: Partial<T>): Observable<T> {
    return this.http.post<T>(this.baseUrl, item, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  actualizar(id: string, item: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${id}`, item, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  protected handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en API:', error);
    
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400: errorMessage = error.error?.message || 'Solicitud incorrecta'; break;
        case 401: errorMessage = 'No autorizado'; break;
        case 403: errorMessage = 'Acceso denegado'; break;
        case 404: errorMessage = 'Recurso no encontrado'; break;
        default: errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}