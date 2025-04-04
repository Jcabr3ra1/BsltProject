import { Account } from './cuenta.model';
import { User } from '../seguridad/usuario.model';
import { EstadoTransaccion } from './estado-transaccion.enum';

/**
 * Modelo de Tipo de Transacción
 */
export interface TipoTransaccion {
  id: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

/**
 * Modelo unificado de Transacción
 */
export interface Transaccion {
  id: string;
  monto: number;
  descripcion: string;
  fecha: Date;
  estado: string;
  
  // Campos con nomenclatura snake_case (API)
  tipo_transaccion_id?: string;
  cuenta_origen_id?: string;
  cuenta_destino_id?: string;
  bolsillo_origen_id?: string;
  bolsillo_destino_id?: string;
  usuario_id?: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  
  // Campos con nomenclatura camelCase (Frontend)
  tipo?: string;
  tipoTransaccion?: TipoTransaccion;
  cuentaOrigenId?: string;
  cuentaDestinoId?: string;
  bolsilloOrigenId?: string;
  bolsilloDestinoId?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Relaciones
  cuentaOrigen?: Account;
  cuentaDestino?: Account;
  estadoTransaccion?: EstadoTransaccion;
}

/**
 * Modelo para solicitud de nueva transacción
 */
export interface TransaccionRequest {
  tipo: string;
  monto: number;
  descripcion: string;
  cuentaOrigenId?: string;
  cuentaDestinoId?: string;
  bolsilloOrigenId?: string;
  bolsilloDestinoId?: string;
  userId?: string;
}

/**
 * Filtros para búsqueda de transacciones
 */
export interface TransaccionFiltros {
  accountId?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  montoMinimo?: number;
  montoMaximo?: number;
}

// Alias para compatibilidad con código existente
export type Transaction = Transaccion;
export type CreateTransactionRequest = TransaccionRequest;
export type TransactionFilters = TransaccionFiltros;

// Tipos de transacción
export enum TipoTransaccionEnum {
  CUENTA_CUENTA = 'CUENTA_CUENTA',
  CUENTA_BOLSILLO = 'CUENTA_BOLSILLO',
  BOLSILLO_CUENTA = 'BOLSILLO_CUENTA',
  BANCO_CUENTA = 'BANCO_CUENTA',
  BANCO_BOLSILLO = 'BANCO_BOLSILLO',
  CUENTA_BANCO = 'CUENTA_BANCO'
}

// Estados de transacción
export enum EstadoTransaccionEnum {
  PENDIENTE = 'PENDING',
  APROBADA = 'APPROVED',
  RECHAZADA = 'REJECTED',
  CANCELADA = 'CANCELLED'
}

// Para compatibilidad con código existente
export const TransactionType = TipoTransaccionEnum;
export const TransactionStatus = EstadoTransaccionEnum;
