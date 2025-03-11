import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

/**
 * Servicio base para realizar solicitudes HTTP
 * 
 * Este servicio proporciona métodos genéricos para realizar solicitudes HTTP
 * a los diferentes endpoints de la API, utilizando la configuración centralizada.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiGatewayUrl = API_CONFIG.API_GATEWAY_URL;

  constructor(private http: HttpClient) { }

  /**
   * Realiza una solicitud GET
   * @param endpoint Endpoint relativo a la URL base
   * @param params Parámetros de consulta opcionales
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  public get<T>(endpoint: string, params?: any, headers?: HttpHeaders): Observable<T> {
    const options = {
      params: this.buildParams(params),
      headers: headers
    };
    // Si el endpoint ya es una URL completa, no agregar la URL base
    const url = endpoint.startsWith('http') ? endpoint : `${this.apiGatewayUrl}${endpoint}`;
    return this.http.get<T>(url, options);
  }

  /**
   * Realiza una solicitud POST
   * @param endpoint Endpoint relativo a la URL base
   * @param body Cuerpo de la solicitud
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  public post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    // Si el endpoint ya es una URL completa, no agregar la URL base
    const url = endpoint.startsWith('http') ? endpoint : `${this.apiGatewayUrl}${endpoint}`;
    return this.http.post<T>(url, body, { headers });
  }

  /**
   * Realiza una solicitud PUT
   * @param endpoint Endpoint relativo a la URL base
   * @param body Cuerpo de la solicitud
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  public put<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    // Si el endpoint ya es una URL completa, no agregar la URL base
    const url = endpoint.startsWith('http') ? endpoint : `${this.apiGatewayUrl}${endpoint}`;
    return this.http.put<T>(url, body, { headers });
  }

  /**
   * Realiza una solicitud DELETE
   * @param endpoint Endpoint relativo a la URL base
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  public delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    // Si el endpoint ya es una URL completa, no agregar la URL base
    const url = endpoint.startsWith('http') ? endpoint : `${this.apiGatewayUrl}${endpoint}`;
    return this.http.delete<T>(url, { headers });
  }

  /**
   * Realiza una solicitud PATCH
   * @param endpoint Endpoint relativo a la URL base
   * @param body Cuerpo de la solicitud
   * @param headers Cabeceras HTTP opcionales
   * @returns Observable con la respuesta
   */
  public patch<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    // Si el endpoint ya es una URL completa, no agregar la URL base
    const url = endpoint.startsWith('http') ? endpoint : `${this.apiGatewayUrl}${endpoint}`;
    return this.http.patch<T>(url, body, { headers });
  }

  /**
   * Construye los parámetros HTTP a partir de un objeto
   * @param params Objeto con los parámetros
   * @returns HttpParams
   */
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return httpParams;
  }
}
