// src/app/core/models/seguridad/rol.model.ts
import { Permiso } from './Permiso.model';

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  
  // Relaciones
  permisos?: Permiso[] | string[];
  
  // Campos para compatibilidad con el backend
  _id?: string;
  
  // Fechas
  createdAt?: Date | string;
  updatedAt?: Date | string;
  fechaCreacion?: Date | string;
  fechaActualizacion?: Date | string;
}