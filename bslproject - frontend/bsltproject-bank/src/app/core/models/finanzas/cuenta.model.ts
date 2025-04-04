// src/app/core/models/finanzas/cuenta.model.ts
export interface Cuenta {
  id: string;
  numero: string;
  tipo: string;
  saldo: number;
  usuarioId?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  
  // Campos para compatibilidad
  _id?: string;
  numero_cuenta?: string;
  userId?: string;
  tipo_cuenta?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum TipoCuenta {
  CORRIENTE = 'CUENTA_CORRIENTE',
  AHORRO = 'CUENTA_AHORRO',
  NOMINA = 'CUENTA_NOMINA'
}

export interface CuentaRequest {
  numero?: string;
  tipo: string;
  saldo?: number;
  usuarioId?: string;
}