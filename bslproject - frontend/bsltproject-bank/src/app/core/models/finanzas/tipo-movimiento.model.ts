// src/app/core/models/finanzas/tipo-movimiento.model.ts
export interface TipoMovimiento {
  id: string;
  nombre: string;
  descripcion?: string;
  codigoOrigen: string;
  codigoDestino: string;
  
  // Campos adicionales
  permiteBolsillo?: boolean;
  activo?: boolean;
  
  // Para compatibilidad con el backend
  _id?: string;
  codigo_origen?: string;
  codigo_destino?: string;
  estado?: boolean;
  
  // Fechas
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export enum CodigoOrigen {
  ACCOUNT = 'ACCOUNT',
  WALLET = 'WALLET',
  BANK = 'BANK'
}

export enum CodigoDestino {
  ACCOUNT = 'ACCOUNT',
  WALLET = 'WALLET',
  BANK = 'BANK'
}

export interface TipoMovimientoRequest {
  nombre: string;
  descripcion?: string;
  codigoOrigen: string;
  codigoDestino: string;
  permiteBolsillo?: boolean;
}