export interface Bolsillo {
  id: string;
  nombre: string;
  saldo: number;
  
  // Compatibilidad con el backend
  id_cuenta?: string;     // Campo del backend
  cuentaId?: string;      // Campo frontend
  
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
  cuentaId?: string;
  meta?: number;
}

// Aliasing para compatibilidad con código que use el término en inglés
export type Pocket = Bolsillo;