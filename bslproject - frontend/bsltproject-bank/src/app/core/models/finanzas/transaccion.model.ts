import { Cuenta } from './cuenta.model';
import { Usuario } from '../seguridad/usuario.model';

/**
 * Modelo de Transacción
 * 
 * Representa una transacción financiera en el sistema
 */
export interface Transaccion {
  id: string;
  monto: number;
  descripcion: string;
  fechaTransaccion: Date;
  cuentaOrigenId: string;
  cuentaDestinoId?: string;
  cuentaOrigen?: Cuenta;
  cuentaDestino?: Cuenta;
  tipoTransaccionId: string;
  tipoTransaccion?: TipoTransaccion;
  tipoMovimientoId: string;
  tipoMovimiento?: TipoMovimiento;
  estado: EstadoTransaccion;
  referencia?: string;
  usuarioId: string;
  usuario?: Usuario;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

/**
 * Modelo de Tipo de Transacción
 * 
 * Representa un tipo de transacción (transferencia, depósito, retiro, etc.)
 */
export interface TipoTransaccion {
  id: string;
  nombre: string;
  descripcion?: string;
  requiereDestino: boolean;
}

/**
 * Modelo de Tipo de Movimiento
 * 
 * Representa un tipo de movimiento (entrada, salida)
 */
export interface TipoMovimiento {
  id: string;
  nombre: string;
  descripcion?: string;
  afectaSaldo: 1 | -1; // 1 para incremento, -1 para decremento
}

/**
 * Enumeración de estados de transacción
 */
export enum EstadoTransaccion {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
  RECHAZADA = 'RECHAZADA',
  ANULADA = 'ANULADA'
}

/**
 * Modelo para solicitud de nueva transacción
 */
export interface TransaccionRequest {
  monto: number;
  descripcion: string;
  cuentaOrigenId: string;
  cuentaDestinoId?: string;
  tipoTransaccionId: string;
  tipoMovimientoId: string;
  referencia?: string;
}
