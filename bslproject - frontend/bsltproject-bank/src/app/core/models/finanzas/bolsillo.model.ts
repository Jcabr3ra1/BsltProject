import { Account } from './cuenta.model';
import { User } from '../seguridad/usuario.model';

/**
 * Model of Pocket
 * 
 * Represents a pocket associated with an account
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

/**
 * Model for pocket type
 */
export interface PocketType {
  id: string;
  name: string;
  description?: string;
}

/**
 * Model for pocket status
 */
export interface PocketStatus {
  id: string;
  name: string;
  description?: string;
}

/**
 * Model for pocket transaction
 */
export interface PocketTransaction {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  description?: string;
  createdAt: Date;
  pocketId: string;
  pocket?: Pocket;
}

/**
 * Model for pocket creation request
 */
export interface PocketRequest {
  name: string;
  accountId: string;
}
