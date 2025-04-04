// src/app/core/models/finanzas/bolsillo.model.ts
export interface Bolsillo {
  id: string;
  nombre: string;
  saldo: number;
  
  // Compatibilidad con el backend
  _id?: string;             // ID de MongoDB
  id_cuenta?: string;       // Campo del backend
  cuentaId?: string;        // Campo frontend
  
  // Campos adicionales
  meta?: number;
  color?: string;
  
  // Relaciones expandidas
  cuenta?: any;             // Datos de la cuenta asociada cuando se populan
  
  // Fechas
  fechaCreacion?: Date | string;
  fechaActualizacion?: Date | string;
  
  // Propiedades en inglés para compatibilidad
  name?: string;
  balance?: number;
  accountId?: string;
  goal?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface BolsilloRequest {
  nombre: string;
  cuentaId?: string;
  meta?: number;
  color?: string;
}

// Aliasing para compatibilidad con código que use el término en inglés
export type Pocket = Bolsillo;