// src/app/core/models/finanzas/bolsillo.model.ts
export interface Bolsillo {
  id: string;
  nombre: string;
  saldo: number;
  cuentaId?: string;
  meta?: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  
  // Propiedades en inglés para compatibilidad
  name?: string;
  balance?: number;
  accountId?: string;
  goal?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BolsilloRequest {
  nombre: string;
  cuentaId: string;
  meta?: number;
}