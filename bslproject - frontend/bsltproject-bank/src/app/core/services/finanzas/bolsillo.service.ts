import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Pocket } from '@core/models/finanzas/bolsillo.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BolsilloService {
  private baseUrl = `${environment.apiGatewayUrl}/finanzas/bolsillos`;
  private headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Pocket[]> {
    return this.http.get<Pocket[]>(this.baseUrl, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  obtenerPorId(id: string): Observable<Pocket> {
    return this.http.get<Pocket>(`${this.baseUrl}/${id}`, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  crear(bolsillo: Pocket): Observable<Pocket> {
    return this.http.post<Pocket>(this.baseUrl, bolsillo, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  actualizar(id: string, bolsillo: Pocket): Observable<Pocket> {
    return this.http.put<Pocket>(`${this.baseUrl}/${id}`, bolsillo, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  obtenerPorCuenta(cuentaId: string): Observable<Pocket[]> {
    return this.http.get<Pocket[]>(`${this.baseUrl}/cuenta/${cuentaId}`, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  cerrarBolsillo(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/cerrar`, {}, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  transferirEntreBolsillos(idOrigen: string, idDestino: string, monto: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/transferir`, {
      bolsilloOrigenId: idOrigen,
      bolsilloDestinoId: idDestino,
      monto: monto
    }, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en BolsilloService:', error);
    return throwError(() => error);
  }
}
