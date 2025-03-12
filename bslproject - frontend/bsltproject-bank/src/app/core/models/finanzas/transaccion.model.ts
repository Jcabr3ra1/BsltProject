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
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

/**
 * Tipos de transacciones posibles
 */
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER'
}

/**
 * Modelo de Transacción
 * 
 * Representa una transacción financiera en el sistema
 */
export interface Transaction {
  id: string;
  accountId: string;
  account?: Account;
  type: TransactionType;
  amount: number;
  description?: string;
  status: TransactionStatus;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Modelo para solicitud de nueva transacción
 */
export interface TransactionRequest {
  accountId: string;
  type: TransactionType;
  amount: number;
  description?: string;
}

/**
 * Filtros para búsqueda de transacciones
 */
export interface TransactionFilters {
  accountId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
}

// For backward compatibility
export type Transaccion = Transaction;
export type TransaccionRequest = TransactionRequest;
export type TipoTransaccion = TransactionType;
export type EstadoTransaccion = TransactionStatus;
