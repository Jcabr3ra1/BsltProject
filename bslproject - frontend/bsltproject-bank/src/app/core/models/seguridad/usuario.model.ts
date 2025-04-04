// src/app/core/models/seguridad/usuario.model.ts
import { Rol } from './rol.model';
import { Estado } from './estado.model';
import { Cuenta } from '../finanzas/cuenta.model';

export interface Usuario {
  id: string;
  nombre: string;
  apellido?: string;
  email: string;
  password?: string;
  
  // Relaciones
  roles?: Rol[] | string[];
  estado?: Estado | string;
  cuentaId?: string;
  
  // Campos para compatibilidad con el backend
  _id?: string;
  id_cuenta?: string;
  
  // Propiedades en inglés para compatibilidad
  name?: string;
  lastName?: string;
  role?: string | Rol;
  state?: string | Estado;
  account?: any;
  accountId?: string;
  
  // Relaciones expandidas
  cuenta?: any;
  
  // Fechas
  fechaCreacion?: Date | string;
  fechaActualizacion?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo?: string;  // Tipo de token, usualmente "Bearer"
  user: Usuario;
  mensaje?: string;
  message?: string;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

// Definir alias para compatibilidad hacia atrás
export type User = Usuario;