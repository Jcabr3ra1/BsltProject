import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Transaccion, EstadoTransaccion } from '../../models/finanzas/transaccion.model';
import { HttpService } from '../http/http.service';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {
  private financeApi = API_CONFIG.FINANCE_API;

  constructor(private httpService: HttpService) {}

  /**
   * Obtiene todas las transacciones
   * @returns Observable con la lista de transacciones
   */
  getTransacciones(): Observable<Transaccion[]> {
    console.log('TransaccionService - Obteniendo todas las transacciones');
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BASE}`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    // En un entorno de desarrollo, podemos devolver datos de prueba
    if (location.hostname === 'localhost' && false) { // Deshabilitamos los datos de prueba para usar la API real
      const mockTransacciones: Transaccion[] = [
        {
          id: '1',
          monto: 100000,
          descripcion: 'Transferencia de prueba',
          fechaTransaccion: new Date(),
          estado: EstadoTransaccion.COMPLETADA,
          tipoTransaccionId: '1',
          cuentaOrigenId: '1',
          cuentaDestinoId: '2',
          usuarioId: '1',
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          tipoMovimientoId: '1'
        },
        {
          id: '2',
          monto: 50000,
          descripcion: 'Retiro de prueba',
          fechaTransaccion: new Date(),
          estado: EstadoTransaccion.COMPLETADA,
          tipoTransaccionId: '2',
          cuentaOrigenId: '1',
          usuarioId: '1',
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          tipoMovimientoId: '2'
        }
      ];
      return of(mockTransacciones);
    }
    
    return this.httpService.get<Transaccion[]>(endpoint);
  }

  /**
   * Obtiene las transacciones de una cuenta específica
   * @param cuentaId ID de la cuenta
   * @returns Observable con la lista de transacciones de la cuenta
   */
  getTransaccionesPorCuenta(cuentaId: string): Observable<Transaccion[]> {
    console.log(`TransaccionService - Obteniendo transacciones para la cuenta ${cuentaId}`);
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BASE}?cuentaId=${cuentaId}`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    return this.httpService.get<Transaccion[]>(endpoint);
  }

  /**
   * Obtiene las transacciones por usuario
   * @param usuarioId ID del usuario
   * @returns Observable con la lista de transacciones del usuario
   */
  getTransaccionesPorUsuario(usuarioId: string): Observable<Transaccion[]> {
    console.log(`TransaccionService - Obteniendo transacciones para el usuario ${usuarioId}`);
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BASE}?usuarioId=${usuarioId}`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    return this.httpService.get<Transaccion[]>(endpoint);
  }

  /**
   * Obtiene una transacción por su ID
   * @param id ID de la transacción
   * @returns Observable con la transacción
   */
  getTransaccion(id: string): Observable<Transaccion> {
    console.log(`TransaccionService - Obteniendo transacción con ID ${id}`);
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BY_ID(id)}`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    return this.httpService.get<Transaccion>(endpoint);
  }

  /**
   * Crea una nueva transacción
   * @param transaccion Datos de la transacción a crear
   * @returns Observable con la transacción creada
   */
  crearTransaccion(transaccion: Partial<Transaccion>): Observable<Transaccion> {
    console.log('TransaccionService - Creando transacción:', transaccion);
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BASE}`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    return this.httpService.post<Transaccion>(endpoint, transaccion);
  }

  /**
   * Realiza una transferencia entre cuentas
   * @param data Datos de la transferencia
   * @returns Observable con la transacción creada
   */
  transferenciaCuentaCuenta(data: {
    cuentaOrigenId: string;
    cuentaDestinoId: string;
    tipoMovimientoId: string;
    monto: number;
    descripcion: string;
  }): Observable<Transaccion> {
    console.log('TransaccionService - Realizando transferencia entre cuentas:', data);
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BASE}`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    return this.httpService.post<Transaccion>(endpoint, data);
  }

  /**
   * Realiza una transferencia de cuenta a bolsillo
   * @param data Datos de la transferencia
   * @returns Observable con la transacción creada
   */
  transferenciaCuentaBolsillo(data: {
    cuentaOrigenId: string;
    bolsilloDestinoId: string;
    tipoMovimientoId: string;
    monto: number;
    descripcion: string;
  }): Observable<Transaccion> {
    console.log('TransaccionService - Realizando transferencia de cuenta a bolsillo:', data);
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BASE}/cuenta-bolsillo`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    return this.httpService.post<Transaccion>(endpoint, data);
  }

  /**
   * Realiza un retiro de bolsillo a cuenta
   * @param data Datos del retiro
   * @returns Observable con la transacción creada
   */
  retiroBolsilloCuenta(data: {
    bolsilloOrigenId: string;
    cuentaDestinoId: string;
    tipoMovimientoId: string;
    monto: number;
    descripcion: string;
  }): Observable<Transaccion> {
    console.log('TransaccionService - Realizando retiro de bolsillo a cuenta:', data);
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BASE}/bolsillo-cuenta`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    return this.httpService.post<Transaccion>(endpoint, data);
  }

  /**
   * Realiza una consignación de banco a cuenta
   * @param data Datos de la consignación
   * @returns Observable con la transacción creada
   */
  consignacionBancoCuenta(data: {
    cuentaDestinoId: string;
    tipoMovimientoId: string;
    monto: number;
    descripcion: string;
  }): Observable<Transaccion> {
    console.log('TransaccionService - Realizando consignación de banco a cuenta:', data);
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BASE}/banco-cuenta`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    return this.httpService.post<Transaccion>(endpoint, data);
  }

  /**
   * Realiza una consignación de banco a bolsillo
   * @param data Datos de la consignación
   * @returns Observable con la transacción creada
   */
  consignacionBancoBolsillo(data: {
    bolsilloDestinoId: string;
    tipoMovimientoId: string;
    monto: number;
    descripcion: string;
  }): Observable<Transaccion> {
    console.log('TransaccionService - Realizando consignación de banco a bolsillo:', data);
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BASE}/banco-bolsillo`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    return this.httpService.post<Transaccion>(endpoint, data);
  }

  /**
   * Realiza un retiro de cuenta a banco
   * @param data Datos del retiro
   * @returns Observable con la transacción creada
   */
  retiroCuentaBanco(data: {
    cuentaOrigenId: string;
    tipoMovimientoId: string;
    monto: number;
    descripcion: string;
  }): Observable<Transaccion> {
    console.log('TransaccionService - Realizando retiro de cuenta a banco:', data);
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BASE}/cuenta-banco`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    return this.httpService.post<Transaccion>(endpoint, data);
  }

  /**
   * Anula una transacción
   * @param id ID de la transacción a anular
   * @returns Observable que completa cuando se anula la transacción
   */
  anularTransaccion(id: string): Observable<void> {
    console.log(`TransaccionService - Anulando transacción con ID ${id}`);
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BY_ID(id)}/anular`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    return this.httpService.patch<void>(endpoint, {});
  }

  /**
   * Obtiene el historial de transacciones con filtros opcionales
   * @param fechaInicio Fecha de inicio opcional
   * @param fechaFin Fecha de fin opcional
   * @param tipo Tipo de transacción opcional
   * @returns Observable con la lista de transacciones filtradas
   */
  getHistorialTransacciones(
    fechaInicio?: Date,
    fechaFin?: Date,
    tipo?: string
  ): Observable<Transaccion[]> {
    console.log('TransaccionService - Obteniendo historial de transacciones');
    let params: any = {};
    
    if (fechaInicio) {
      params.fechaInicio = fechaInicio.toISOString();
    }
    
    if (fechaFin) {
      params.fechaFin = fechaFin.toISOString();
    }
    
    if (tipo) {
      params.tipo = tipo;
    }
    
    const endpoint = `${this.financeApi.BASE_URL}${this.financeApi.TRANSACTIONS.BASE}/historial`;
    console.log('TransaccionService - Endpoint:', endpoint);
    
    return this.httpService.get<Transaccion[]>(endpoint, { params });
  }
}
