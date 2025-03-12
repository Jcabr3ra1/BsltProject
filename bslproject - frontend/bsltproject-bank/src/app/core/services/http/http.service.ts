import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

/**
 * Base service for making HTTP requests
 * 
 * This service provides generic methods for making HTTP requests
 * to different API endpoints, using centralized configuration.
 * It automatically handles base URLs and query parameters.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly apiGatewayUrl = API_CONFIG.API_GATEWAY_URL;

  constructor(private readonly http: HttpClient) { }

  /**
   * Make a GET request
   * @param endpoint Endpoint relative to base URL or full URL
   * @param params Optional query parameters
   * @param headers Optional HTTP headers
   * @returns Observable with the response
   */
  public get<T>(endpoint: string, params?: any, headers?: HttpHeaders): Observable<T> {
    const options = {
      params: this.buildParams(params),
      headers: headers
    };
    const url = this.buildUrl(endpoint);
    return this.http.get<T>(url, options);
  }

  /**
   * Make a POST request
   * @param endpoint Endpoint relative to base URL or full URL
   * @param body Request body
   * @param headers Optional HTTP headers
   * @returns Observable with the response
   */
  public post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.post<T>(url, body, { headers });
  }

  /**
   * Make a PUT request
   * @param endpoint Endpoint relative to base URL or full URL
   * @param body Request body
   * @param headers Optional HTTP headers
   * @returns Observable with the response
   */
  public put<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.put<T>(url, body, { headers });
  }

  /**
   * Make a DELETE request
   * @param endpoint Endpoint relative to base URL or full URL
   * @param headers Optional HTTP headers
   * @returns Observable with the response
   */
  public delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.delete<T>(url, { headers });
  }

  /**
   * Make a PATCH request
   * @param endpoint Endpoint relative to base URL or full URL
   * @param body Request body
   * @param headers Optional HTTP headers
   * @returns Observable with the response
   */
  public patch<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.patch<T>(url, body, { headers });
  }

  /**
   * Build HTTP parameters from an object
   * @param params Object containing parameters
   * @returns HttpParams instance
   * @private
   */
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value);
        }
      });
    }
    return httpParams;
  }

  /**
   * Build the complete URL for an endpoint
   * @param endpoint Endpoint relative to base URL or full URL
   * @returns Complete URL
   * @private
   */
  private buildUrl(endpoint: string): string {
    return endpoint.startsWith('http') ? endpoint : `${this.apiGatewayUrl}${endpoint}`;
  }
}
