import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Cuenta, TipoCuenta, EstadoCuenta } from '../../models/finanzas/cuenta.model';
import { HttpService } from '../http/http.service';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class CuentaService {
  private financeApi = API_CONFIG.FINANCE_API;

  constructor(private httpService: HttpService) {}

  /**
   * Obtiene todas las cuentas del usuario actual
   * @returns Observable con la lista de cuentas
   */
  getCuentas(): Observable<Cuenta[]> {
    console.log('CuentaService - Obteniendo cuentas');
    const endpoint = this.financeApi.ACCOUNTS.BASE;
    console.log('CuentaService - Endpoint:', endpoint);
    
    // En un entorno de desarrollo, podemos devolver datos de prueba
    if (location.hostname === 'localhost' && false) { // Deshabilitamos los datos de prueba para usar la API real
      const mockCuentas: Cuenta[] = [
        {
          id: '1',
          numero: '1001-001',
          saldo: 1500000,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          usuarioId: '1',
          tipo: TipoCuenta.AHORRO,
          estado: EstadoCuenta.ACTIVA
        },
        {
          id: '2',
          numero: '1001-002',
          saldo: 2500000,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          usuarioId: '1',
          tipo: TipoCuenta.CORRIENTE,
          estado: EstadoCuenta.ACTIVA
        }
      ];
      return of(mockCuentas);
    }
    
    return this.httpService.get<Cuenta[]>(endpoint);
  }

  /**
   * Obtiene las cuentas de un usuario específico
   * @param usuarioId ID del usuario
   * @returns Observable con la lista de cuentas del usuario
   */
  getCuentasPorUsuario(usuarioId: string): Observable<Cuenta[]> {
    console.log(`CuentaService - Obteniendo cuentas del usuario ${usuarioId}`);
    const endpoint = `${this.financeApi.ACCOUNTS.BASE}?usuarioId=${usuarioId}`;
    console.log('CuentaService - Endpoint:', endpoint);
    
    return this.httpService.get<Cuenta[]>(endpoint);
  }

  /**
   * Obtiene una cuenta por su ID
   * @param id ID de la cuenta
   * @returns Observable con la cuenta
   */
  getCuenta(id: string): Observable<Cuenta> {
    console.log(`CuentaService - Obteniendo cuenta con ID: ${id}`);
    const endpoint = this.financeApi.ACCOUNTS.BY_ID(id);
    console.log('CuentaService - Endpoint:', endpoint);
    
    return this.httpService.get<Cuenta>(endpoint);
  }

  /**
   * Crea una nueva cuenta
   * @param cuenta Datos de la cuenta a crear
   * @returns Observable con la cuenta creada
   */
  crearCuenta(cuenta: Partial<Cuenta>): Observable<Cuenta> {
    console.log('CuentaService - Creando cuenta:', cuenta);
    const endpoint = this.financeApi.ACCOUNTS.BASE;
    console.log('CuentaService - Endpoint:', endpoint);
    
    return this.httpService.post<Cuenta>(endpoint, cuenta);
  }

  /**
   * Actualiza una cuenta existente
   * @param id ID de la cuenta
   * @param cuenta Datos actualizados de la cuenta
   * @returns Observable con la cuenta actualizada
   */
  actualizarCuenta(id: string, cuenta: Partial<Cuenta>): Observable<Cuenta> {
    console.log(`CuentaService - Actualizando cuenta con ID: ${id}`, cuenta);
    const endpoint = this.financeApi.ACCOUNTS.BY_ID(id);
    console.log('CuentaService - Endpoint:', endpoint);
    
    return this.httpService.put<Cuenta>(endpoint, cuenta);
  }

  /**
   * Elimina una cuenta
   * @param id ID de la cuenta a eliminar
   * @returns Observable que completa cuando la cuenta es eliminada
   */
  eliminarCuenta(id: string): Observable<void> {
    console.log(`CuentaService - Eliminando cuenta con ID: ${id}`);
    const endpoint = this.financeApi.ACCOUNTS.BY_ID(id);
    console.log('CuentaService - Endpoint:', endpoint);
    
    return this.httpService.delete<void>(endpoint);
  }

  /**
   * Obtiene el saldo de una cuenta
   * @param id ID de la cuenta
   * @returns Observable con el saldo de la cuenta
   */
  getSaldo(id: string): Observable<number> {
    console.log(`CuentaService - Obteniendo saldo de cuenta con ID: ${id}`);
    const endpoint = this.financeApi.ACCOUNTS.UPDATE_BALANCE(id);
    console.log('CuentaService - Endpoint:', endpoint);
    
    return this.httpService.get<number>(endpoint);
  }

  /**
   * Realiza una transferencia entre cuentas
   * @param cuentaOrigenId ID de la cuenta de origen
   * @param cuentaDestinoId ID de la cuenta de destino
   * @param monto Monto a transferir
   * @returns Observable que completa cuando se realiza la transferencia
   */
  realizarTransferencia(cuentaOrigenId: string, cuentaDestinoId: string, monto: number): Observable<void> {
    console.log(`CuentaService - Realizando transferencia de ${monto} desde cuenta ${cuentaOrigenId} a cuenta ${cuentaDestinoId}`);
    const endpoint = this.financeApi.TRANSACTIONS.BASE;
    console.log('CuentaService - Endpoint:', endpoint);
    
    return this.httpService.post<void>(endpoint, {
      cuentaOrigenId,
      cuentaDestinoId,
      monto,
      tipoTransaccionId: '1', // Asumimos que el ID 1 es para transferencias
      descripcion: 'Transferencia entre cuentas'
    });
  }
}
