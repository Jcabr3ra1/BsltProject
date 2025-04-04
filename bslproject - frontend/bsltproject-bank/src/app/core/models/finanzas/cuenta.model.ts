import { User } from '../seguridad/usuario.model';

/**
 * Modelo de Cuenta
 * 
 * Representa una cuenta bancaria en el sistema financiero
 */
export enum AccountType {
  CUENTA_CORRIENTE = 'CUENTA_CORRIENTE',
  CUENTA_AHORRO = 'CUENTA_AHORRO',
  AHORROS = 'AHORROS', // Tipo de cuenta de ahorros utilizado por el backend (posible duplicado)
  CUENTA_NOMINA = 'CUENTA_NOMINA',
  CUENTA_INFANTIL = 'CUENTA_INFANTIL',
  CUENTA_JOVEN = 'CUENTA_JOVEN',
  BOLSILLO = 'BOLSILLO'
}

export interface Account {
  id: string;
  numero: string;  // Número de cuenta
  tipo: AccountType;
  saldo: number;
  userId: string;  // ID principal del usuario (formato UUID o MongoDB)
  createdAt?: Date | string; // Puede venir como string desde el backend
  updatedAt?: Date | string; // Puede venir como string desde el backend
  
  // Campos adicionales que pueden venir del backend
  _id?: string;          // ID en formato MongoDB de la cuenta
  numero_cuenta?: string; // Número de cuenta alternativo
  usuario_id?: string;    // ID alternativo del usuario (posiblemente otro formato o sistema)
  id_usuario?: string;    // Otra forma de ID de usuario que podría venir del backend
  nombre?: string;        // Nombre de la cuenta
  color?: string;         // Color de la cuenta para UI (ejemplo: "#1976D2")
  id_bolsillo?: string | null; // ID del bolsillo asociado, si existe
}

export interface CreateAccountRequest {
  tipo: AccountType;
  saldoInicial: number;
}

export interface AccountFilters {
  userId?: string;
  type?: AccountType;
  minBalance?: number;
  maxBalance?: number;
}

// For backward compatibility
export type Cuenta = Account;
export type TipoCuenta = AccountType;

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
