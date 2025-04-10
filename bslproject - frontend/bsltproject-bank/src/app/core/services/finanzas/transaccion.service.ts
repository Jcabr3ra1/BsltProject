// src/app/core/services/finanzas/transaccion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseApiService } from '../base-api.service';
import { Transaccion, TransaccionRequest } from '@core/models/finanzas/transaccion.model';
import { Cuenta } from '@core/models/finanzas/cuenta.model';
import { environment } from '@environments/environment';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { AuthService } from '../seguridad/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService extends BaseApiService<Transaccion> {
  constructor(
    http: HttpClient,
    protected override authService: AuthService
  ) {
    super(http, `${environment.apiGatewayUrl}/finanzas/transacciones`, authService);
  }
  
  // Método para obtener cuentas del usuario actual
  obtenerCuentas(): Observable<Cuenta[]> {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario');
      return of([]);
    }
    
    // Usar ID de usuario fijo para usuarios conocidos (para pruebas)
    let finalUserId = userId;
    if (userId === '67a2661729e4496e2f332d59') {
      finalUserId = '67a2661729e4496e2f332d59'; // Admin
    } else if (userId === '67d362f17a90d255eaf9c510') {
      finalUserId = '67d362f17a90d255eaf9c510'; // Usuario test
    }
    
    console.log(`Obteniendo cuentas para usuario: ${finalUserId}`);
    
    // Asegurar que se incluya el token de autorización
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getToken() || ''
    });
    
    // Usar la URL correcta con el prefijo /finanzas
    return this.http.get<Cuenta[]>(
      `${environment.apiGatewayUrl}/finanzas/cuentas/usuario/${finalUserId}`,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error al obtener cuentas:', error);
        return of([]);
      })
    );
  }
  
  // Método especializado para obtener transacciones por usuario
  obtenerTransaccionesPorUsuario(usuarioId: string): Observable<Transaccion[]> {
    console.log(`Iniciando obtenerTransaccionesPorUsuario para usuario: ${usuarioId}`);
    
    // Asegurar que se incluya el token de autorización
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getToken() || ''
    });
    
    console.log('Headers de la solicitud:', headers);
    console.log(`URL de la solicitud: ${environment.apiGatewayUrl}/finanzas/transacciones/usuario/${usuarioId}`);
    
    return this.http.get<Transaccion[]>(
      `${environment.apiGatewayUrl}/finanzas/transacciones/usuario/${usuarioId}`,
      { headers }
    ).pipe(
      switchMap(response => {
        console.log('Respuesta recibida del servidor:', response);
        return of(response);
      }),
      catchError(error => {
        console.error('Error detallado al obtener transacciones:', error);
        if (error.status === 404) {
          console.log('No se encontraron transacciones para el usuario (404)');
        } else if (error.status === 401) {
          console.error('Error de autenticación (401)');
        }
        return of([]);
      })
    );
  }
  
  // Método especializado para transferencias cuenta a cuenta
  transferenciaCuentaCuenta(transaccion: TransaccionRequest): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiGatewayUrl}/finanzas/transferencias/cuenta-cuenta`,
      transaccion,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método especializado para transferencias cuenta a bolsillo
  transferenciaCuentaBolsillo(transaccion: TransaccionRequest): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiGatewayUrl}/finanzas/transferencias/cuenta-bolsillo`,
      transaccion,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método especializado para transferencias bolsillo a cuenta
  transferenciaBolsilloCuenta(transaccion: TransaccionRequest): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiGatewayUrl}/finanzas/transferencias/bolsillo-cuenta`,
      transaccion,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método para crear una nueva transacción
  crearTransaccion(transaccion: TransaccionRequest): Observable<Transaccion> {
    return this.http.post<Transaccion>(
      `${environment.apiGatewayUrl}/finanzas/transacciones`,
      transaccion,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método para eliminar una transacción
  eliminarTransaccion(transaccionId: string): Observable<any> {
    return this.http.delete(
      `${environment.apiGatewayUrl}/finanzas/transacciones/${transaccionId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método para rechazar una transacción
  rechazarTransaccion(transaccionId: string): Observable<any> {
    return this.http.put(
      `${environment.apiGatewayUrl}/finanzas/transacciones/${transaccionId}/rechazar`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método para aprobar una transacción
  aprobarTransaccion(transaccionId: string): Observable<any> {
    return this.http.put(
      `${environment.apiGatewayUrl}/finanzas/transacciones/${transaccionId}/aprobar`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }
  
  // Método para obtener todas las transacciones del usuario actual
  obtenerTransacciones(): Observable<Transaccion[]> {
    console.log('Iniciando obtenerTransacciones()');
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario');
      return of([]);
    }
    
    console.log(`Obteniendo transacciones para usuario: ${userId}`);
    
    // Verificar si hay un token válido
    const token = this.authService.getToken();
    if (!token) {
      console.error('No hay token de autenticación disponible');
      return throwError(() => new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.'));
    }
    
    console.log(`Token disponible: ${token.substring(0, 15)}...`);
    
    return this.obtenerTransaccionesPorUsuario(userId).pipe(
      switchMap(transacciones => {
        console.log(`Transacciones obtenidas: ${transacciones.length}`);
        
        // Verificar si el resultado es un array
        if (!Array.isArray(transacciones)) {
          console.warn('La respuesta no es un array:', transacciones);
          // Intentar convertir a array si es posible
          if (transacciones && typeof transacciones === 'object') {
            // Si es un objeto con una propiedad que contiene el array
            const posibleArray = Object.values(transacciones).find(val => Array.isArray(val));
            if (posibleArray) {
              console.log('Se encontró un array dentro del objeto respuesta');
              return of(posibleArray as Transaccion[]);
            }
          }
          return of([]);
        }
        
        if (transacciones.length === 0) {
          // Si no hay transacciones, intentamos obtener todas las transacciones como fallback
          console.log('No se encontraron transacciones específicas del usuario, intentando obtener todas');
          return this.obtenerTodos().pipe(
            map((allTransacciones: Transaccion[]) => {
              console.log(`Todas las transacciones obtenidas: ${allTransacciones.length}`);
              // Filtrar solo las transacciones del usuario actual si es posible
              const userTransacciones = allTransacciones.filter((t: Transaccion) => 
                t.usuarioId === userId || 
                t.usuario_id === userId ||
                t.userId === userId
              );
              console.log(`Transacciones filtradas para el usuario: ${userTransacciones.length}`);
              return userTransacciones;
            }),
            catchError(error => {
              console.error('Error al obtener todas las transacciones:', error);
              return of([]);
            })
          );
        }
        
        // Normalizar las transacciones para asegurar que todos los campos necesarios existan
        const transaccionesNormalizadas = transacciones.map(t => this.normalizarTransaccion(t));
        return of(transaccionesNormalizadas);
      }),
      catchError(error => {
        console.error('Error en obtenerTransacciones:', error);
        // Si es un error 401, propagar el error para que se maneje en el componente
        if (error.status === 401) {
          return throwError(() => error);
        }
        return of([]);
      })
    );
  }
  
  // Método para normalizar una transacción y asegurar que tenga todos los campos necesarios
  private normalizarTransaccion(transaccion: any): Transaccion {
    if (!transaccion) return {} as Transaccion;
    
    // Crear una copia para no modificar el original
    const t = { ...transaccion };
    
    // Normalizar ID
    t.id = t.id || t._id || t.transaccionId || '';
    
    // Normalizar fechas
    t.fecha = t.fecha || t.createdAt || t.fecha_creacion || t.fecha_transaccion || new Date().toISOString();
    
    // Normalizar monto
    t.monto = typeof t.monto === 'number' ? t.monto : 
              typeof t.monto === 'string' ? parseFloat(t.monto) : 
              t.valor || t.amount || 0;
    
    // Normalizar tipo
    t.tipo = t.tipo || t.tipoTransaccion || t.tipo_transaccion || 'CUENTA_CUENTA';
    
    // Normalizar estado
    t.estado = t.estado || t.estadoTransaccion || t.estado_transaccion || 'PENDIENTE';
    
    // Normalizar descripción
    t.descripcion = t.descripcion || t.concepto || t.description || '';
    
    // Normalizar origen y destino
    t.origen = t.origen || t.cuentaOrigen || t.cuenta_origen || {};
    t.destino = t.destino || t.cuentaDestino || t.cuenta_destino || {};
    
    // Normalizar usuario
    t.usuarioId = t.usuarioId || t.usuario_id || t.userId || '';
    
    return t as Transaccion;
  }
  
  // Método para obtener todas las transacciones
  obtenerTodasTransacciones(): Observable<Transaccion[]> {
    return this.obtenerTodos().pipe(
      catchError(error => {
        console.error('Error al obtener transacciones:', error);
        return throwError(() => new Error('Error al obtener transacciones'));
      })
    );
  }
  
  // Método para obtener próximos pagos
  obtenerProximosPagos(usuarioId: string): Observable<any[]> {
    const httpOptions = {
      headers: this.getHeaders(),
      observe: 'body' as const,
      responseType: 'json' as const
    };
    
    return this.http.get<any[]>(`${this.baseUrl}/usuario/${usuarioId}/proximos-pagos`, httpOptions).pipe(
      catchError(error => {
        console.error('Error al obtener próximos pagos:', error);
        return throwError(() => new Error('Error al obtener próximos pagos'));
      })
    );
  }
}