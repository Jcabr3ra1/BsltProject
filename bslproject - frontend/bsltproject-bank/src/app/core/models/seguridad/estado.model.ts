// src/app/core/models/seguridad/estado.model.ts
export interface Estado {
  id: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  
  // Campos para compatibilidad con el backend
  _id?: string;
  
  // Fechas
  createdAt?: Date | string;
  updatedAt?: Date | string;
  fechaCreacion?: Date | string;
  fechaActualizacion?: Date | string;
}