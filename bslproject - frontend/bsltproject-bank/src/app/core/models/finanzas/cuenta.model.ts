import { User } from '../seguridad/usuario.model';

/**
 * Modelo de Cuenta
 * 
 * Representa una cuenta bancaria en el sistema financiero
 */
export enum AccountType {
  SAVINGS = 'SAVINGS',
  CHECKING = 'CHECKING'
}

/**
 * Enumeración de estados de cuenta
 */
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}

export interface Account {
  id: string;
  userId?: string;
  accountNumber: string;
  type: AccountType;
  balance: number;
  status: AccountStatus;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
}

export interface AccountRequest {
  accountNumber: string;
  balance: number;
  status: AccountStatus;
  userId: string;
}

export interface AccountFilters {
  userId?: string;
  type?: AccountType;
  status?: AccountStatus;
  minBalance?: number;
  maxBalance?: number;
}

// For backward compatibility
export type Cuenta = Account;
export type TipoCuenta = AccountType;
export type EstadoCuenta = AccountStatus;

/**
 * Modelo de Bolsillo
 * 
 * Representa un bolsillo o subcuenta asociada a una cuenta principal
 */
export interface Pocket {
  id: string;
  name: string;
  balance: number;
  goal?: number;
  createdAt: Date;
  updatedAt?: Date;
  accountId: string;
  account?: Account;
  user?: User;
}
