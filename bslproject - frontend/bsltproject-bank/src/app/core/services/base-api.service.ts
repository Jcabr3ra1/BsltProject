/**
 * Servicio base para comunicación con API
 * Proporciona métodos CRUD genéricos para entidades
 */
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from './seguridad/auth.service';

/**
 * Opciones para las peticiones HTTP
 * Omitimos responseType ya que se maneja internamente en los métodos HTTP
 */
export interface RequestOptions {
  headers?: HttpHeaders;
  params?: HttpParams | Record<string, string | string[]>;
  reportProgress?: boolean;
  withCredentials?: boolean;
}

/**
 * Respuesta genérica para operaciones de API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Clase base para servicios API
 * Proporciona métodos CRUD genéricos para cualquier entidad
 * @template T Tipo de entidad que maneja el servicio
 */
@Injectable()
export abstract class BaseApiService<T> {
  /**
   * Constructor del servicio base
   * @param http Cliente HTTP para realizar peticiones
   * @param baseUrl URL base para las peticiones API
   * @param authService Servicio de autenticación (opcional)
   */
  constructor(
    protected readonly http: HttpClient,
    protected readonly baseUrl: string,
    // Cambiamos a protected para que las clases derivadas puedan acceder
    protected authService?: AuthService
  ) {}

  /**
   * Obtiene los headers HTTP con el token de autorización
   * @returns HttpHeaders con token de autorización
   */
  protected getHeaders(): HttpHeaders {
    // Si tenemos el servicio de autenticación, usarlo para obtener el token
    const token = this.authService?.getToken() || localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers = headers.set('Authorization', formattedToken);
    }
    
    return headers;
  }

  /**
   * Obtiene todos los registros de la entidad
   * @param options Opciones adicionales para la petición
   * @returns Observable con array de entidades
   */
  obtenerTodos(options?: RequestOptions): Observable<T[]> {
    const httpOptions = {
      headers: this.getHeaders(),
      observe: 'body' as const,
      responseType: 'json' as const,
      ...options
    };
    
    return this.http.get<T[]>(this.baseUrl, httpOptions)
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Obtiene un registro por su ID
   * @param id Identificador del registro
   * @param options Opciones adicionales para la petición
   * @returns Observable con la entidad
   */
  obtenerPorId(id: string, options?: RequestOptions): Observable<T> {
    const httpOptions = {
      headers: this.getHeaders(),
      observe: 'body' as const,
      responseType: 'json' as const,
      ...options
    };
    
    return this.http.get<T>(`${this.baseUrl}/${id}`, httpOptions)
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Obtiene registros por un campo específico
   * @param field Campo por el que filtrar
   * @param value Valor del campo
   * @param options Opciones adicionales para la petición
   * @returns Observable con array de entidades
   */
  obtenerPorCampo(field: string, value: string, options?: RequestOptions): Observable<T[]> {
    const params = new HttpParams().set(field, value);
    const httpOptions = {
      headers: this.getHeaders(),
      params,
      observe: 'body' as const,
      responseType: 'json' as const,
      ...options
    };
    
    return this.http.get<T[]>(`${this.baseUrl}/buscar`, httpOptions)
      .pipe(
        retry(1),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Crea un nuevo registro
   * @param item Datos del nuevo registro
   * @param options Opciones adicionales para la petición
   * @returns Observable con la entidad creada
   */
  crear(item: Partial<T>, options?: RequestOptions): Observable<T> {
    const httpOptions = {
      headers: this.getHeaders(),
      observe: 'body' as const,
      responseType: 'json' as const,
      ...options
    };
    
    return this.http.post<T>(this.baseUrl, item, httpOptions)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Actualiza un registro existente
   * @param id Identificador del registro
   * @param item Datos actualizados
   * @param options Opciones adicionales para la petición
   * @returns Observable con la entidad actualizada
   */
  actualizar(id: string, item: Partial<T>, options?: RequestOptions): Observable<T> {
    const httpOptions = {
      headers: this.getHeaders(),
      observe: 'body' as const,
      responseType: 'json' as const,
      ...options
    };
    
    return this.http.put<T>(`${this.baseUrl}/${id}`, item, httpOptions)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Actualiza parcialmente un registro existente
   * @param id Identificador del registro
   * @param item Datos parciales a actualizar
   * @param options Opciones adicionales para la petición
   * @returns Observable con la entidad actualizada
   */
  actualizarParcial(id: string, item: Partial<T>, options?: RequestOptions): Observable<T> {
    const httpOptions = {
      headers: this.getHeaders(),
      observe: 'body' as const,
      responseType: 'json' as const,
      ...options
    };
    
    return this.http.patch<T>(`${this.baseUrl}/${id}`, item, httpOptions)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Elimina un registro
   * @param id Identificador del registro a eliminar
   * @param options Opciones adicionales para la petición
   * @returns Observable con la respuesta
   */
  eliminar(id: string, options?: RequestOptions): Observable<any> {
    const httpOptions = {
      headers: this.getHeaders(),
      observe: 'body' as const,
      responseType: 'json' as const,
      ...options
    };
    
    return this.http.delete(`${this.baseUrl}/${id}`, httpOptions)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Maneja errores HTTP y los transforma en mensajes amigables
   * @param error Error HTTP recibido
   * @returns Observable que emite un error
   */
  protected handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error de red: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = this.getServerErrorMessage(error);
    }
    
    console.error('Error en API:', error, errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Obtiene un mensaje de error amigable basado en el código de estado HTTP
   * @param error Error HTTP recibido
   * @returns Mensaje de error amigable
   */
  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400: 
        return this.extractErrorMessage(error) || 'Solicitud incorrecta';
      case 401: 
        return 'No autorizado. Por favor inicie sesión nuevamente';
      case 403: 
        return 'Acceso denegado. No tiene permisos para esta operación';
      case 404: 
        return 'Recurso no encontrado';
      case 500: 
        return 'Error interno del servidor';
      case 0: 
        return 'No se pudo conectar con el servidor. Verifique su conexión';
      default: 
        return this.extractErrorMessage(error) || `Error del servidor: ${error.status}`;
    }
  }

  /**
   * Extrae el mensaje de error de la respuesta del servidor
   * @param error Error HTTP recibido
   * @returns Mensaje de error o undefined si no se encuentra
   */
  private extractErrorMessage(error: HttpErrorResponse): string | undefined {
    return error.error?.message || 
           error.error?.error || 
           error.error?.detail || 
           (typeof error.error === 'string' ? error.error : undefined);
  }
}