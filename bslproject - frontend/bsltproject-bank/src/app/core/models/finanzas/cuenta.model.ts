import { User } from '../seguridad/usuario.model';

/**
 * Modelo de Cuenta
 * 
 * Representa una cuenta bancaria en el sistema financiero
 */
export enum AccountType {
  CUENTA = 'CUENTA',
  BOLSILLO = 'BOLSILLO'
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
  numero: string;  // Número de cuenta
  tipo: AccountType;
  saldo: number;
  estado: AccountStatus;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateAccountRequest {
  tipo: AccountType;
  saldoInicial: number;
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
