import { Account } from './cuenta.model';
import { User } from '../seguridad/usuario.model';

/**
 * Modelo de Bolsillo
 * 
 * Representa un bolsillo o subcuenta asociada a una cuenta principal
 */
export interface Bolsillo {
  id: string;
  nombre: string;
  saldo: number;
  meta?: number;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  cuentaId: string;
  usuarioId?: string;
  
  // Propiedades en inglés para compatibilidad
  name?: string;
  balance?: number;
  goal?: number;
  createdAt?: Date;
  updatedAt?: Date;
  accountId?: string;
  userId?: string;
  
  // Relaciones
  cuenta?: Account;
  usuario?: User;
}

/**
 * Modelo para solicitud de creación de bolsillo
 */
export interface BolsilloRequest {
  nombre: string;
  cuentaId: string;
  meta?: number;
  
  // Propiedades en inglés para compatibilidad
  name?: string;
  accountId?: string;
  goal?: number;
}

// Alias para compatibilidad con código existente
export type Pocket = Bolsillo;
export type PocketRequest = BolsilloRequest;
