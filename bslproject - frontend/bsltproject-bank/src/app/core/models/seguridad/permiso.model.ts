// src/app/core/models/seguridad/permiso.model.ts
export interface Permiso {
    id: string;
    nombre: string;
    descripcion?: string;
    
    // Campos para compatibilidad con el backend
    _id?: string;
    
    // Fechas
    createdAt?: Date | string;
    updatedAt?: Date | string;
    fechaCreacion?: Date | string;
    fechaActualizacion?: Date | string;
  }