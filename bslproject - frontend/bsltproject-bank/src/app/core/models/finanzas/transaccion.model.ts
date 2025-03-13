import { Account } from './cuenta.model';
import { Pocket } from './bolsillo.model';
import { User } from '../seguridad/usuario.model';

/**
 * Estados posibles de una transacción
 */
export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

/**
 * Tipos de transacciones posibles
 */
export enum TransactionType {
  CUENTA_CUENTA = 'CUENTA_CUENTA',
  CUENTA_BOLSILLO = 'CUENTA_BOLSILLO',
  BOLSILLO_CUENTA = 'BOLSILLO_CUENTA',
  BANCO_CUENTA = 'BANCO_CUENTA',
  BANCO_BOLSILLO = 'BANCO_BOLSILLO',
  CUENTA_BANCO = 'CUENTA_BANCO'
}

/**
 * Modelo de Transacción
 * 
 * Representa una transacción financiera en el sistema
 */
export interface Transaction {
  id: string;
  tipo: TransactionType;
  monto: number;
  estado: TransactionStatus;
  descripcion: string;
  cuentaOrigenId?: string;
  cuentaDestinoId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Modelo para solicitud de nueva transacción
 */
export interface CreateTransactionRequest {
  tipo: TransactionType;
  monto: number;
  descripcion: string;
  cuentaOrigenId?: string;
  cuentaDestinoId?: string;
  userId: string;
}

/**
 * Filtros para búsqueda de transacciones
 */
export interface TransactionFilters {
  accountId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
}

// For backward compatibility
export type Transaccion = Transaction;
export type TransaccionRequest = CreateTransactionRequest;
export type TipoTransaccion = TransactionType;
export type EstadoTransaccion = TransactionStatus;
