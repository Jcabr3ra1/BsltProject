import { Usuario } from '../seguridad/usuario.model';

/**
 * Modelo de Cuenta
 * 
 * Representa una cuenta bancaria en el sistema financiero
 */
export interface Cuenta {
  id: string;
  numero: string;
  saldo: number;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
  usuarioId: string;
  usuario?: Usuario;
  tipo: TipoCuenta;
  estado: EstadoCuenta;
  bolsillos?: Bolsillo[];
}

/**
 * Enumeración de tipos de cuenta
 */
export enum TipoCuenta {
  AHORRO = 'AHORRO',
  CORRIENTE = 'CORRIENTE',
  CREDITO = 'CREDITO'
}

/**
 * Enumeración de estados de cuenta
 */
export enum EstadoCuenta {
  ACTIVA = 'ACTIVA',
  INACTIVA = 'INACTIVA',
  BLOQUEADA = 'BLOQUEADA',
  CERRADA = 'CERRADA'
}

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
  cuenta?: Cuenta;
}
