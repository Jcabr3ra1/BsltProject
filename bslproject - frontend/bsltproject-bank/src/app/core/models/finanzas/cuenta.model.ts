// src/app/core/models/finanzas/cuenta.model.ts
import { Bolsillo } from './bolsillo.model';

export interface Cuenta {
  id: string;
  numero: string;
  tipo: string;
  saldo: number;
  
  // Relaciones
  usuarioId?: string;
  id_bolsillo?: string;
  bolsilloId?: string;
  
  // Campos estéticos
  nombre?: string;
  color?: string;
  
  // Campos para compatibilidad con MongoDB y backend
  _id?: string;
  numero_cuenta?: string;
  tipo_cuenta?: string;
  userId?: string;
  id_usuario?: string;
  
  // Relaciones expandidas (para respuestas populadas)
  usuario?: any;
  bolsillos?: Bolsillo[];
  
  // Fechas
  fechaCreacion?: Date | string;
  fechaActualizacion?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
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
  nombre?: string;
  color?: string;
}